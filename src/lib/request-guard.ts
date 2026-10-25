export class BodyTooLargeError extends Error {}

/**
 * Reads the request body as text but stops as soon as it exceeds `maxBytes`,
 * so an oversized or chunked payload is never buffered in full.
 */
export async function readBodyLimited(request: Request, maxBytes: number): Promise<string> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) throw new BodyTooLargeError();
  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > maxBytes) {
      await reader.cancel();
      throw new BodyTooLargeError();
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(bytes);
}

type Window = { count: number; resetAt: number };

/**
 * Fixed-window limiter kept in the memory of one server instance. It is a
 * first line of defence only: serverless instances do not share it, so a
 * platform rule (Vercel Firewall) or a database counter is still needed for a
 * global limit.
 */
export function createRateLimiter(limit: number, windowMs: number, maxKeys = 10_000) {
  const windows = new Map<string, Window>();
  return {
    take(key: string, now = Date.now()): { allowed: true } | { allowed: false; retryAfterSeconds: number } {
      const current = windows.get(key);
      if (!current || current.resetAt <= now) {
        if (windows.size >= maxKeys) {
          for (const [k, w] of windows) if (w.resetAt <= now) windows.delete(k);
          const oldest = windows.keys().next().value;
          if (windows.size >= maxKeys && oldest !== undefined) windows.delete(oldest);
        }
        windows.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true };
      }
      if (current.count >= limit) return { allowed: false, retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) };
      current.count += 1;
      return { allowed: true };
    },
    reset() { windows.clear(); },
  };
}

/** Vercel overwrites x-forwarded-for with the real client address; elsewhere it is only a hint. */
export function clientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
