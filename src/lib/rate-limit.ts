// Պարզ in-memory rate limiter (dev/single-instance-ի համար)
// Production-ում օգտագործիր Redis-ով (օրինակ՝ @upstash/ratelimit)

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

const WINDOW_MS = 60_000; // 1 րոպե
const MAX_REQUESTS = 20;  // 1 րոպեում 20 հարցում

export function rateLimit(key: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }

  if (entry.count >= MAX_REQUESTS) {
    return {
      ok: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return { ok: true };
}

// Հին գրառումների մաքրում (ամեն 5 րոպեն)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 5 * 60_000).unref?.();
}