/**
 * Enables Next.js draft mode for editors, then returns a client-visible redirect target.
 * Intended for authenticated admin users only (see requireApiRole below).
 */
import { UserRole } from '@prisma/client';
import { draftMode } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { adminPublishPreviewPostSchema } from '@/lib/api/admin-body-schemas';
import { readValidatedJson } from '@/lib/api/json-request';
import { requireApiRole } from '@/lib/api/admin';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function POST(request: NextRequest) {
  const rateLimitError = applyRateLimit(request, 30);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;

  const parsed = await readValidatedJson(request, adminPublishPreviewPostSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const draft = await draftMode();
  draft.enable();
  return NextResponse.json({ preview: true, redirectTo: body.redirectTo ?? '/' });
}

export async function DELETE(request: NextRequest) {
  const rateLimitError = applyRateLimit(request, 30);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;

  const draft = await draftMode();
  draft.disable();
  return NextResponse.json({ preview: false });
}
