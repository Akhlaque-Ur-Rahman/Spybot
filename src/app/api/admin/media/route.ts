import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { adminMediaPostSchema } from '@/lib/api/admin-body-schemas';
import { readValidatedJson } from '@/lib/api/json-request';
import { requireApiRole } from '@/lib/api/admin';
import {
  buildMediaListOrderBy,
  buildMediaListWhere,
  parseMediaListQuery,
} from '@/lib/admin/media-list-query';
import { inferMimeTypeFromPath, isAllowedMediaMimeType, normalizeMediaTags } from '@/lib/admin/media-ingest';
import { prisma } from '@/lib/db/prisma';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function GET(request: NextRequest) {
  const rateLimitError = applyRateLimit(request, 240);
  if (rateLimitError) return rateLimitError;
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

  const parsed = await readValidatedJson(request, adminMediaPostSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;
  const normalizedUrl = body.url.trim();
  const normalizedAlt = body.alt?.trim() ? body.alt.trim() : null;
  const normalizedTags = normalizeMediaTags(body.tags);
  const guessedMime = inferMimeTypeFromPath(normalizedUrl);
  const explicitMime = body.mimeType?.trim() ? body.mimeType.trim().toLowerCase() : null;
  const resolvedMime = explicitMime ?? guessedMime;
  if (resolvedMime && !isAllowedMediaMimeType(resolvedMime)) {
    return NextResponse.json({ error: 'Unsupported media type. Use image/video/audio or PDF URLs.' }, { status: 400 });
  }

  const existing = await prisma.mediaAsset.findFirst({ where: { url: normalizedUrl } });
  if (existing) {
    return NextResponse.json({ asset: existing, duplicate: true });
  }

  const asset = await prisma.mediaAsset.create({
    data: {
      url: normalizedUrl,
      alt: normalizedAlt,
      tags: normalizedTags,
      mimeType: resolvedMime ?? null,
    },
  });
  return NextResponse.json({ asset }, { status: 201 });
}
