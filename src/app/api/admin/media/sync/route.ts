import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/api/admin';
import { inferMimeTypeFromPath, isAllowedMediaMimeType } from '@/lib/admin/media-ingest';
import { prisma } from '@/lib/db/prisma';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

async function walkFiles(root: string, dir = root): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const abs = join(dir, entry.name);
      if (entry.isDirectory()) return walkFiles(root, abs);
      if (!entry.isFile()) return [];
      return [abs];
    })
  );
  return nested.flat();
}

export async function POST(request: NextRequest) {
  const rateLimitError = applyRateLimit(request, 8);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;

  const mediaRoot = join(process.cwd(), 'public', 'media');
  const allFiles = await walkFiles(mediaRoot).catch(() => []);
  if (!allFiles.length) {
    return NextResponse.json({ imported: 0, skipped: 0, total: 0 });
  }

  const urls = allFiles
    .map((abs) => relative(mediaRoot, abs).replace(/\\/g, '/'))
    .map((relPath) => `/media/${relPath}`)
    .filter((url) => !url.includes('/.'));
  const existing = await prisma.mediaAsset.findMany({
    where: { url: { in: urls } },
    select: { url: true },
  });
  const existingSet = new Set(existing.map((row) => row.url));

  const toCreate = urls
    .filter((url) => !existingSet.has(url))
    .map((url) => {
      const mime = inferMimeTypeFromPath(url);
      if (!mime || !isAllowedMediaMimeType(mime)) return null;
      return { url, mimeType: mime, tags: [] as string[] };
    })
    .filter((x): x is { url: string; mimeType: string; tags: string[] } => Boolean(x));

  if (toCreate.length) {
    await prisma.mediaAsset.createMany({
      data: toCreate.map((row) => ({
        url: row.url,
        mimeType: row.mimeType,
        tags: row.tags,
      })),
    });
  }

  return NextResponse.json({
    imported: toCreate.length,
    skipped: urls.length - toCreate.length,
    total: urls.length,
  });
}
