import { UserRole } from '@prisma/client';
import { draftMode } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/api/admin';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function POST(request: NextRequest) {
  const rateLimitError = applyRateLimit(request, 30);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;

  const body = await request.json();
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
