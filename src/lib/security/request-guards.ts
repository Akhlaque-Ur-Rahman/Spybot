import { NextRequest, NextResponse } from 'next/server';

const limiter = new Map<string, { count: number; resetAt: number }>();
let lastCleanupAt = 0;

function cleanupLimiter(now: number) {
  if (now - lastCleanupAt < 30_000) return;
  lastCleanupAt = now;
  for (const [key, slot] of limiter.entries()) {
    if (slot.resetAt < now) limiter.delete(key);
  }
}

async function applyDistributedRateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<{ limited: boolean; retryAfterSec: number } | null> {
  const redisUrl = process.env.CMS_RATE_LIMIT_REDIS_URL?.trim();
  const redisToken = process.env.CMS_RATE_LIMIT_REDIS_TOKEN?.trim();
  if (!redisUrl || !redisToken) return null;

  try {
    const response = await fetch(`${redisUrl}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${redisToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      body: JSON.stringify([
        ['INCR', key],
        ['PTTL', key],
        ['PEXPIRE', key, String(windowMs), 'NX'],
      ]),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as Array<{ result?: unknown }>;
    const count = Number(payload?.[0]?.result ?? 0);
    const ttlRaw = Number(payload?.[1]?.result ?? windowMs);
    const ttlMs = Number.isFinite(ttlRaw) && ttlRaw > 0 ? ttlRaw : windowMs;
    return {
      limited: count > max,
      retryAfterSec: Math.max(1, Math.ceil(ttlMs / 1000)),
    };
  } catch {
    return null;
  }
}

export async function applyRateLimit(
  request: NextRequest,
  max = 60,
  windowMs = 60_000,
  scope = 'default',
) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  const route = request.nextUrl.pathname;
  const method = request.method.toUpperCase();
  const key = `${scope}:${method}:${route}:${ip}`;
  const now = Date.now();

  const distributed = await applyDistributedRateLimit(`rl:${key}`, max, windowMs);
  if (distributed) {
    if (!distributed.limited) return null;
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(distributed.retryAfterSec) } },
    );
  }

  cleanupLimiter(now);
  const current = limiter.get(key);

  if (!current || current.resetAt < now) {
    limiter.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (current.count >= max) {
    const retryAfterSec = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
    );
  }

  current.count += 1;
  limiter.set(key, current);
  return null;
}

export function verifyCsrf(request: NextRequest) {
  const expected = process.env.CMS_CSRF_TOKEN?.trim();
  if (process.env.NODE_ENV === 'production' && !expected) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 503 });
  }
  if (!expected) return null;
  const incoming = request.headers.get('x-csrf-token');
  if (incoming !== expected) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }
  return null;
}
