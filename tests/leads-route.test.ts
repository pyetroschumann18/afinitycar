import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST, globalLimiter, perClientLimiter } from "@/app/api/leads/route";

const submissionId = "11aa22bb-33cc-44dd-88ee-ff0011223344";
const leadId = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const answers = {
  vehicleCategory: "car", purchaseMethod: "financing", budgetRange: "30k_40k",
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
  perClientLimiter.reset();
  globalLimiter.reset();
  vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_test_only");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("POST /api/leads", () => {
  it("sends normalized lead data and confirms a persisted lead", async () => {
    const outbound = vi.fn().mockResolvedValue(new Response(JSON.stringify([{ submission_id: submissionId, lead_id: leadId, inserted: true, status: "processed" }]), { status: 200 }));
    vi.stubGlobal("fetch", outbound);

    const response = await POST(request(envelope));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, submission_id: submissionId, lead_id: leadId });
    const [url, options] = outbound.mock.calls[0];
    expect(url).toBe("https://eelpnvdufxlwyotmxkhn.supabase.co/rest/v1/rpc/ingest_form_submission");
    expect(options.headers).toMatchObject({ apikey: "sb_secret_test_only", "Content-Type": "application/json" });
    expect(JSON.parse(options.body)).toMatchObject({
      p_source_system: "formulario", p_submission_id: submissionId,
      p_payload: {
      submission_id: submissionId, name: "Maria Silva", phone: "+5515998887766", city: "Sorocaba",
      category: "Carro", financing: "Financiamento", budget_label: "R$ 30 mil – R$ 40 mil",
      deposit: null, desired_installment: 850, trade_in: null, desired_vehicle: null,
      source: "formulario", source_created_at: "2026-10-18T12:00:00.000Z",
      landing_url: envelope.landing_url, utm_source: "instagram", raw_payload: answers,
      },
    });
  });

  it.each([
    ["upstream rejection", 500, { error: "database failed" }],
    ["invalid confirmation", 200, [{ submission_id: submissionId, status: "processed" }]],
    ["wrong submission", 200, [{ submission_id: leadId, lead_id: leadId, status: "processed" }]],
    ["accepted but not persisted", 202, [{ submission_id: submissionId, lead_id: leadId, status: "queued" }]],
  ])("does not report success for %s", async (_name, status, body) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status })));
    const response = await POST(request(envelope));
    expect(response.ok).toBe(false);
    expect((await response.json()).success).toBe(false);
  });

  it("rejects invalid phone before calling Supabase", async () => {
    const outbound = vi.fn();
    vi.stubGlobal("fetch", outbound);
    const response = await POST(request({ ...envelope, answers: { ...answers, phone: "12345" } }));
    expect(response.status).toBe(400);
    expect(outbound).not.toHaveBeenCalled();
  });

  it("reports unavailable Supabase without success", async () => {
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

  it("returns unavailable when the server key is not configured", async () => {
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    const outbound = vi.fn();
    vi.stubGlobal("fetch", outbound);
    const response = await POST(request(envelope));
    expect(response.status).toBe(503);
    expect(outbound).not.toHaveBeenCalled();
  });

  it("rejects a public API key before sending lead data", async () => {
    vi.stubEnv("SUPABASE_SECRET_KEY", "sb_publishable_not_private");
    vi.stubEnv("N8N_LEAD_INTAKE_WEBHOOK_URL", "https://example.n8n.cloud/webhook/afinity-intake");
    const outbound = vi.fn();
    vi.stubGlobal("fetch", outbound);
    const response = await POST(request(envelope));
    expect(response.status).toBe(503);
    expect(outbound).not.toHaveBeenCalled();
  });

  it("rejects the removed promissory method and budgets outside R$ 30–80 mil", async () => {
    const outbound = vi.fn();
    vi.stubGlobal("fetch", outbound);
    const promissory = await POST(request({ ...envelope, answers: { ...answers, purchaseMethod: "promissory", downPaymentRange: undefined } }));
    expect(promissory.status).toBe(400);
    for (const budgetRange of ["20k_30k", "above_50k", "80k_90k"]) {
      expect((await POST(request({ ...envelope, answers: { ...answers, budgetRange } }))).status).toBe(400);
    }
    expect(outbound).not.toHaveBeenCalled();
  });

  it("sends the new budget label without inventing a numeric budget or deposit", async () => {
    const outbound = vi.fn().mockResolvedValue(new Response(JSON.stringify([{ submission_id: submissionId, lead_id: leadId, inserted: true, status: "processed" }]), { status: 200 }));
    vi.stubGlobal("fetch", outbound);
    const response = await POST(request({ ...envelope, answers: { ...answers, budgetRange: "70k_80k", monthlyPaymentAmount: "900.25" } }));
    expect(response.status).toBe(200);
    const payload = JSON.parse(outbound.mock.calls[0][1].body).p_payload;
    expect(payload.budget_label).toBe("R$ 70 mil – R$ 80 mil");
    expect(payload.desired_installment).toBe(900.25);
    expect(payload.deposit).toBeNull();
    expect(payload.budget).toBeUndefined();
  });
});

describe("POST /api/leads abuse protection (T44 / F-012)", () => {
  const confirmed = () => new Response(JSON.stringify([{ submission_id: submissionId, lead_id: leadId, inserted: true, status: "processed" }]), { status: 200 });

  it("rejects an oversized chunked body without reading it to the end and without calling Supabase", async () => {
    const outbound = vi.fn();
    vi.stubGlobal("fetch", outbound);
    let pulled = 0;
    const chunk = new TextEncoder().encode("x".repeat(4_000));
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) { pulled += 1; if (pulled > 1_000) controller.close(); else controller.enqueue(chunk); },
    });
    const req = new Request("https://afinitycar.vercel.app/api/leads", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: stream, duplex: "half",
    } as RequestInit);

    const response = await POST(req);
    expect(response.status).toBe(413);
    expect(pulled).toBeLessThan(10);
    expect(outbound).not.toHaveBeenCalled();
  });

  it("rejects a declared content-length above the limit before reading", async () => {
    const outbound = vi.fn();
    vi.stubGlobal("fetch", outbound);
    const req = new Request("https://afinitycar.vercel.app/api/leads", {
      method: "POST", headers: { "Content-Type": "application/json", "Content-Length": "999999" }, body: "{}",
    });
    expect((await POST(req)).status).toBe(413);
    expect(outbound).not.toHaveBeenCalled();
  });

  it("limits a burst from one client but keeps serving another client", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => confirmed()));
    const from = (ip: string) => new Request("https://afinitycar.vercel.app/api/leads", {
      method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": ip }, body: JSON.stringify(envelope),
    });

    const statuses: number[] = [];
    for (let i = 0; i < 8; i += 1) statuses.push((await POST(from("203.0.113.7"))).status);
    expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(statuses.slice(5)).toEqual([429, 429, 429]);

    const limited = await POST(from("203.0.113.7"));
    expect(Number(limited.headers.get("Retry-After"))).toBeGreaterThan(0);
    expect((await POST(from("198.51.100.9"))).status).toBe(200);
  });

  it("caps total submissions per instance even across many addresses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => confirmed()));
    let limited = 0;
    for (let i = 0; i < 130; i += 1) {
      const req = new Request("https://afinitycar.vercel.app/api/leads", {
        method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": `10.0.${Math.floor(i / 250)}.${i % 250}` }, body: JSON.stringify(envelope),
      });
      if ((await POST(req)).status === 429) limited += 1;
    }
    expect(limited).toBe(10);
  });
});
