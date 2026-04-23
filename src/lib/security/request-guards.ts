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

export function applyRateLimit(
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
