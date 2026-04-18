import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/api/admin';
import {
  buildMediaListOrderBy,
  buildMediaListWhere,
  parseMediaListQuery,
} from '@/lib/admin/media-list-query';
import { prisma } from '@/lib/db/prisma';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function GET(request: NextRequest) {
  const auth = await requireApiRole();
  if (auth.error) return auth.error;
  const sp = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = parseMediaListQuery(sp);
  const where = buildMediaListWhere(parsed);
  const orderBy = buildMediaListOrderBy(parsed.sort);
  const total = await prisma.mediaAsset.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / parsed.perPage));
  const page = Math.min(parsed.page, totalPages);
  const skip = (page - 1) * parsed.perPage;
  const assets = await prisma.mediaAsset.findMany({
    where,
    orderBy,
    skip,
    take: parsed.perPage,
  });
  return NextResponse.json({
    assets,
    total,
    page,
    perPage: parsed.perPage,
    totalPages,
    query: { ...parsed, page },
  });
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
