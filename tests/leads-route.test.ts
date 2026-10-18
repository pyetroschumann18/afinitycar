import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/leads/route";

const submissionId = "11aa22bb-33cc-44dd-88ee-ff0011223344";
const leadId = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const answers = {
  vehicleCategory: "car", purchaseMethod: "financing", budgetRange: "20k_30k",
  downPaymentRange: "3k_5k", monthlyPaymentAmount: "850", city: "Sorocaba",
  hasSpecificVehicle: "no", name: "Maria Silva", phone: "(15) 99888-7766",
};

function request(body: unknown) {
  return new Request("https://afinitycar.vercel.app/api/leads", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: "https://afinitycar.vercel.app" },
    body: JSON.stringify(body),
  });
}

const envelope = {
  submission_id: submissionId, source_created_at: "2026-10-18T12:00:00.000Z",
  landing_url: "https://afinitycar.vercel.app/?utm_source=instagram",
  utm_source: "instagram", answers,
};

beforeEach(() => {
  vi.stubEnv("N8N_LEAD_INTAKE_WEBHOOK_URL", "https://example.n8n.cloud/webhook/afinity-intake");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("POST /api/leads", () => {
  it("sends normalized lead data and confirms a persisted lead", async () => {
    const outbound = vi.fn().mockResolvedValue(new Response(JSON.stringify({ submission_id: submissionId, lead_id: leadId, status: "processed" }), { status: 200 }));
    vi.stubGlobal("fetch", outbound);

    const response = await POST(request(envelope));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, submission_id: submissionId, lead_id: leadId });
    const [, options] = outbound.mock.calls[0];
    expect(JSON.parse(options.body)).toMatchObject({
      submission_id: submissionId, name: "Maria Silva", phone: "+5515998887766", city: "Sorocaba",
      category: "Carro", financing: "Financiamento", budget_label: "R$20.000 – R$30.000",
      deposit: null, desired_installment: 850, trade_in: null, desired_vehicle: null,
      source: "formulario", source_created_at: "2026-10-18T12:00:00.000Z",
      landing_url: envelope.landing_url, utm_source: "instagram", raw_payload: answers,
    });
  });

  it.each([
    ["upstream rejection", 500, { error: "database failed" }],
    ["invalid confirmation", 200, { submission_id: submissionId, status: "processed" }],
    ["wrong submission", 200, { submission_id: leadId, lead_id: leadId, status: "processed" }],
    ["accepted but not persisted", 202, { submission_id: submissionId, lead_id: leadId, status: "queued" }],
  ])("does not report success for %s", async (_name, status, body) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status })));
    const response = await POST(request(envelope));
    expect(response.ok).toBe(false);
    expect((await response.json()).success).toBe(false);
  });

  it("rejects invalid phone before calling the webhook", async () => {
    const outbound = vi.fn();
    vi.stubGlobal("fetch", outbound);
    const response = await POST(request({ ...envelope, answers: { ...answers, phone: "12345" } }));
    expect(response.status).toBe(400);
    expect(outbound).not.toHaveBeenCalled();
  });

  it("reports unavailable webhook without success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network unavailable")));
    const response = await POST(request(envelope));
    expect(response.status).toBe(502);
    expect((await response.json()).success).toBe(false);
  });

  it("reports timeout without success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new DOMException("deadline", "TimeoutError")));
    const response = await POST(request(envelope));
    expect(response.status).toBe(504);
    expect((await response.json()).success).toBe(false);
  });

  it("returns unavailable when the server webhook is not configured", async () => {
    vi.stubEnv("N8N_LEAD_INTAKE_WEBHOOK_URL", "");
    const outbound = vi.fn();
    vi.stubGlobal("fetch", outbound);
    const response = await POST(request(envelope));
    expect(response.status).toBe(503);
    expect(outbound).not.toHaveBeenCalled();
  });

  it("uses exact numeric entry for promissory purchase without inventing budget", async () => {
    const outbound = vi.fn().mockResolvedValue(new Response(JSON.stringify({ submission_id: submissionId, lead_id: leadId, status: "processed" }), { status: 200 }));
    vi.stubGlobal("fetch", outbound);
    const response = await POST(request({ ...envelope, answers: {
      ...answers, purchaseMethod: "promissory", downPaymentRange: undefined,
      downPaymentAmount: "5000.50", monthlyPaymentAmount: "900.25",
    } }));
    expect(response.status).toBe(200);
    const payload = JSON.parse(outbound.mock.calls[0][1].body);
    expect(payload.deposit).toBe(5000.5);
    expect(payload.desired_installment).toBe(900.25);
    expect(payload.budget_label).toBe("R$20.000 – R$30.000");
    expect(payload.budget).toBeUndefined();
  });
});
