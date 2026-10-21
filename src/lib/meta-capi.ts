import { createHash } from "node:crypto";

const GRAPH_VERSION = "v23.0";

export type LeadSignal = {
  eventId: string;
  eventSourceUrl?: string;
  name?: string;
  phone?: string;
  city?: string;
  fbp?: string;
  fbc?: string;
  clientIp?: string;
  userAgent?: string;
};

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

const normalizeText = (value?: string) => value?.trim().toLowerCase() || undefined;

function normalizePhone(value?: string) {
  const digits = value?.replace(/\D/g, "");
  if (!digits) return undefined;
  return digits.startsWith("55") && digits.length >= 12 ? digits : `55${digits.replace(/^0+/, "")}`;
}

function hashed(value?: string) {
  return value ? [sha256(value)] : undefined;
}

export async function sendLeadToMeta(signal: LeadSignal): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN;
  if (!pixelId || !accessToken) {
    console.warn("Meta CAPI não configurada (NEXT_PUBLIC_META_PIXEL_ID / META_CONVERSIONS_API_TOKEN).");
    return;
  }

  const [firstName, ...rest] = (normalizeText(signal.name) ?? "").split(/\s+/).filter(Boolean);
  const lastName = rest.length ? rest[rest.length - 1] : undefined;

  const userData = {
    ph: hashed(normalizePhone(signal.phone)),
    fn: hashed(firstName),
    ln: hashed(lastName),
    ct: hashed(normalizeText(signal.city)?.replace(/\s+/g, "")),
    country: hashed("br"),
    fbp: signal.fbp,
    fbc: signal.fbc,
    client_ip_address: signal.clientIp,
    client_user_agent: signal.userAgent,
  };

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: signal.eventId,
        action_source: "website",
        event_source_url: signal.eventSourceUrl,
        user_data: Object.fromEntries(Object.entries(userData).filter(([, v]) => v !== undefined)),
      },
    ],
    access_token: accessToken,
  };
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;

  try {
    const response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) console.error("Meta CAPI recusou o evento Lead:", response.status, await response.text());
  } catch (error) {
    console.error("Falha ao enviar evento Lead para a Meta CAPI:", error);
  }
}
