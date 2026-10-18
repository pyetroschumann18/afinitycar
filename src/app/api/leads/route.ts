import { NextResponse } from "next/server";
import { vehicles } from "@/features/vehicles/vehicles";
import { choices } from "@/features/qualification/qualification.types";
import type { Answers } from "@/features/qualification/qualification.types";

type Submission = {
  submission_id: string;
  source_created_at: string;
  landing_url?: string;
  answers: Answers;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

function invalid(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 400 });
}

function text(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= max ? value.trim() : null;
}

function choice<K extends keyof typeof choices>(key: K, value: unknown): string | null {
  return choices[key].find((item) => item.value === value)?.label ?? null;
}

function amount(value: unknown, max: number): number | null {
  if (typeof value !== "string" || !/^\d+(?:\.\d{1,2})?$/.test(value.trim())) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= max ? number : null;
}

function phoneBrazil(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 30 || /[^\d\s()+.-]/.test(value)) return null;
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) digits = digits.slice(2);
  if (!/^[1-9]\d[2-9]\d{7,8}$/.test(digits)) return null;
  return `+55${digits}`;
}

function logFailure(reason: string, submissionId?: string) {
  console.error("Lead intake failed", { reason, submission_id: submissionId });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return invalid("Origem inválida.");
  if (!request.headers.get("content-type")?.startsWith("application/json")) return invalid("Envio inválido.");

  let submission: Submission;
  try {
    const body = await request.text();
    if (body.length > 12_000) return invalid("Envio muito grande.");
    submission = JSON.parse(body);
  } catch {
    return invalid("Dados inválidos. Confira o formulário e tente novamente.");
  }
  if (!submission || typeof submission !== "object" || !submission.answers || typeof submission.answers !== "object") {
    return invalid("Dados inválidos. Confira o formulário e tente novamente.");
  }
  const { answers } = submission;
  const submissionId = submission.submission_id;
  const createdAt = submission.source_created_at;
  const name = text(answers.name, 80);
  const phone = phoneBrazil(answers.phone);
  const city = text(answers.city, 80);
  const category = choice("vehicleCategory", answers.vehicleCategory);
  const financing = choice("purchaseMethod", answers.purchaseMethod);
  const budgetLabel = choice("budgetRange", answers.budgetRange);
  if (typeof submissionId !== "string" || !uuidPattern.test(submissionId) ||
      typeof createdAt !== "string" || !/^\d{4}-\d\d-\d\dT/.test(createdAt) ||
      !Number.isFinite(Date.parse(createdAt)) || !name || !phone || !city || !category || !financing || !budgetLabel ||
      !choice("hasSpecificVehicle", answers.hasSpecificVehicle)) {
    return invalid("Dados inválidos. Confira o formulário e tente novamente.");
  }
  if (answers.purchaseMethod === "financing" && !choice("downPaymentRange", answers.downPaymentRange)) return invalid("Informe a faixa de entrada.");
  if (answers.purchaseMethod === "trade" && !text(answers.tradeVehicleName, 120)) return invalid("Informe o veículo da troca.");
  if (answers.hasSpecificVehicle === "yes" && !answers.vehicleInterest && !text(answers.specificVehicleName, 200)) return invalid("Informe o veículo desejado.");

  const deposit = answers.purchaseMethod === "promissory" ? amount(answers.downPaymentAmount, 10_000_000) : null;
  const desiredInstallment = answers.purchaseMethod === "financing" || answers.purchaseMethod === "promissory"
    ? amount(answers.monthlyPaymentAmount, 1_000_000) : null;
  if (answers.purchaseMethod === "promissory" && deposit === null) return invalid("Informe um valor de entrada válido.");
  if ((answers.purchaseMethod === "financing" || answers.purchaseMethod === "promissory") && (!desiredInstallment || desiredInstallment <= 0)) return invalid("Informe uma parcela válida.");

  const selectedVehicle = answers.vehicleInterest ? vehicles.find((vehicle) => vehicle.id === answers.vehicleInterest) : null;
  if (answers.vehicleInterest && !selectedVehicle) return invalid("Veículo inválido.");
  const desiredVehicle = answers.hasSpecificVehicle === "yes"
    ? selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model} (${selectedVehicle.year})` : text(answers.specificVehicleName, 200)
    : null;
  const tradeIn = answers.purchaseMethod === "trade"
    ? `${answers.tradeVehicleName!.trim()}${answers.tradeVehicleYear ? ` (${String(answers.tradeVehicleYear).slice(0, 40)})` : ""}`
    : null;

  let landingUrl: string | null = null;
  if (submission.landing_url !== undefined) {
    try {
      if (typeof submission.landing_url !== "string" || submission.landing_url.length > 2_000) return invalid("Endereço de origem inválido.");
      const url = new URL(submission.landing_url);
      if (!/^https?:$/.test(url.protocol)) return invalid("Endereço de origem inválido.");
      landingUrl = url.toString();
    } catch {
      return invalid("Endereço de origem inválido.");
    }
  }
  const utms: Record<string, string> = {};
  for (const key of utmKeys) {
    if (submission[key] !== undefined) {
      const value = text(submission[key], 200);
      if (!value) return invalid("Parâmetros de origem inválidos.");
      utms[key] = value;
    }
  }
  const webhookUrl = process.env.N8N_LEAD_INTAKE_WEBHOOK_URL;
  if (!webhookUrl) {
    logFailure("not_configured", submissionId);
    return NextResponse.json({ success: false, error: "O envio está temporariamente indisponível. Tente novamente mais tarde." }, { status: 503 });
  }
  try {
    if (new URL(webhookUrl).protocol !== "https:") throw new Error("invalid_configuration");
  } catch {
    logFailure("invalid_configuration", submissionId);
    return NextResponse.json({ success: false, error: "O envio está temporariamente indisponível. Tente novamente mais tarde." }, { status: 503 });
  }

  const payload = {
    submission_id: submissionId, name, phone, city, category, financing,
    budget_label: budgetLabel, deposit, desired_installment: desiredInstallment,
    trade_in: tradeIn, desired_vehicle: desiredVehicle, source: "formulario",
    source_created_at: createdAt, landing_url: landingUrl, ...utms, raw_payload: answers,
  };
  try {
    const response = await fetch(webhookUrl, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload), cache: "no-store", signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      logFailure(`upstream_http_${response.status}`, submissionId);
      return NextResponse.json({ success: false, error: "Não foi possível confirmar o envio. Tente novamente." }, { status: 502 });
    }
    let confirmation: unknown;
    try { confirmation = await response.json(); } catch { confirmation = null; }
    if (!confirmation || typeof confirmation !== "object" ||
        (confirmation as Record<string, unknown>).submission_id !== submissionId ||
        (confirmation as Record<string, unknown>).status !== "processed" ||
        typeof (confirmation as Record<string, unknown>).lead_id !== "string" ||
        !uuidPattern.test((confirmation as Record<string, string>).lead_id)) {
      logFailure("invalid_confirmation", submissionId);
      return NextResponse.json({ success: false, error: "Não foi possível confirmar a gravação. Tente novamente." }, { status: 502 });
    }
    return NextResponse.json({ success: true, submission_id: submissionId, lead_id: (confirmation as Record<string, string>).lead_id });
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    logFailure(timedOut ? "timeout" : "network_failure", submissionId);
    return NextResponse.json({ success: false, error: timedOut ? "O envio demorou demais. Tente novamente." : "O envio está temporariamente indisponível. Tente novamente." }, { status: timedOut ? 504 : 502 });
  }
}
