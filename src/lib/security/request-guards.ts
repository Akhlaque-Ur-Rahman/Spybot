import { NextRequest, NextResponse } from 'next/server';

const limiter = new Map<string, { count: number; resetAt: number }>();

export function applyRateLimit(request: NextRequest, max = 60, windowMs = 60_000) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  const now = Date.now();
  const current = limiter.get(ip);

  if (!current || current.resetAt < now) {
    limiter.set(ip, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (current.count >= max) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  current.count += 1;
  limiter.set(ip, current);
  return null;
}

export function verifyCsrf(request: NextRequest) {
  const expected = process.env.CMS_CSRF_TOKEN;
  if (!expected) return null;
  const incoming = request.headers.get('x-csrf-token');
  if (incoming !== expected) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }
  return null;
}
