/**
 * Enables Next.js draft mode for editors, then returns a client-visible redirect target.
 * Intended for authenticated admin users only (see requireApiRole below).
 */
import { draftMode } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { adminPublishPreviewPostSchema } from '@/lib/api/admin-body-schemas';
import { readValidatedJson } from '@/lib/api/json-request';
import { requireApiCapability } from '@/lib/api/admin';
import {
  CMS_PREVIEW_EXPIRES_COOKIE,
  CMS_PREVIEW_MAX_AGE_SEC,
  getPreviewExpiryIso,
} from '@/lib/cms/preview-session';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function POST(request: NextRequest) {
  const rateLimitError = await applyRateLimit(request, 30);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiCapability('preview.open');
  if (auth.error) return auth.error;

  const parsed = await readValidatedJson(request, adminPublishPreviewPostSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const draft = await draftMode();
  draft.enable();
  const expiresAt = getPreviewExpiryIso();
  const response = NextResponse.json({ preview: true, redirectTo: body.redirectTo ?? '/', expiresAt });
  response.cookies.set(CMS_PREVIEW_EXPIRES_COOKIE, expiresAt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: CMS_PREVIEW_MAX_AGE_SEC,
  });
  return response;
}

export async function DELETE(request: NextRequest) {
  const rateLimitError = await applyRateLimit(request, 30);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiCapability('preview.open');
  if (auth.error) return auth.error;

  const draft = await draftMode();
  draft.disable();
  const response = NextResponse.json({ preview: false });
  response.cookies.set(CMS_PREVIEW_EXPIRES_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
