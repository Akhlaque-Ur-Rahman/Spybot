import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/api/admin';
import { prisma } from '@/lib/db/prisma';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function GET() {
  const auth = await requireApiRole();
  if (auth.error) return auth.error;
  const assets = await prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ assets });
}

export async function POST(request: NextRequest) {
  const rateLimitError = applyRateLimit(request, 30);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;
  const body = await request.json();
  const asset = await prisma.mediaAsset.create({
    data: { url: body.url, alt: body.alt, tags: body.tags ?? [], mimeType: body.mimeType },
  });
  return NextResponse.json({ asset }, { status: 201 });
}
