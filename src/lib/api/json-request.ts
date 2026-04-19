import { NextResponse } from 'next/server';
import type { ZodType } from 'zod';

/**
 * Parses JSON and validates with Zod. Returns 400 for malformed JSON or schema failure.
 */
export async function readValidatedJson<T>(
  request: Request,
  schema: ZodType<T>
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { ok: false, response: NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) };
  }
  const r = schema.safeParse(raw);
  if (!r.success) {
    return { ok: false, response: NextResponse.json({ error: 'Invalid payload' }, { status: 400 }) };
  }
  return { ok: true, data: r.data };
}

/**
 * JSON parse only — use when validation is custom or layered.
 */
export async function readJsonBody(
  request: Request
): Promise<{ ok: true; data: unknown } | { ok: false; response: NextResponse }> {
  try {
    return { ok: true, data: await request.json() };
  } catch {
    return { ok: false, response: NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) };
  }
}
