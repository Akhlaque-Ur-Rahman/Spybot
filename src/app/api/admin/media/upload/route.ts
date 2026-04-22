import { mkdir, stat, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/api/admin';
import {
  MEDIA_MAX_UPLOAD_BYTES,
  inferMimeTypeFromPath,
  isAllowedMediaMimeType,
  normalizeMediaTags,
  toSafeFileStem,
} from '@/lib/admin/media-ingest';
import { prisma } from '@/lib/db/prisma';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

function parseCommaTags(raw: string | null): string[] {
  if (!raw) return [];
  return raw.split(',').map((t) => t.trim());
}

async function nextAvailableFilePath(dir: string, baseStem: string, ext: string): Promise<{ diskPath: string; publicUrl: string }> {
  for (let index = 0; index < 2000; index += 1) {
    const suffix = index === 0 ? '' : `-${index + 1}`;
    const fileName = `${baseStem}${suffix}${ext}`;
    const diskPath = join(dir, fileName);
    try {
      await stat(diskPath);
    } catch {
      return { diskPath, publicUrl: `/media/${fileName}` };
    }
  }
  throw new Error('Could not allocate a unique filename.');
}

export async function POST(request: NextRequest) {
  const rateLimitError = applyRateLimit(request, 20);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;

  const form = await request.formData();
  const fileEntry = form.get('file');
  if (!(fileEntry instanceof File)) {
    return NextResponse.json({ error: 'A file is required.' }, { status: 400 });
  }
  if (!fileEntry.size) {
    return NextResponse.json({ error: 'Uploaded file is empty.' }, { status: 400 });
  }
  if (fileEntry.size > MEDIA_MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'File is too large. Maximum size is 100 MB.' }, { status: 413 });
  }

  const originalExt = extname(fileEntry.name).toLowerCase();
  const ext = originalExt || '.bin';
  const mimeFromFile = fileEntry.type?.trim().toLowerCase() || null;
  const mimeFromExt = inferMimeTypeFromPath(fileEntry.name);
  const mimeType = mimeFromFile ?? mimeFromExt;
  if (!mimeType || !isAllowedMediaMimeType(mimeType)) {
    return NextResponse.json({ error: 'Unsupported file type. Upload image/video/audio or PDF files.' }, { status: 400 });
  }

  const altRaw = form.get('alt');
  const tagsRaw = form.get('tags');
  const alt = typeof altRaw === 'string' && altRaw.trim() ? altRaw.trim().slice(0, 500) : null;
  const tags = normalizeMediaTags(parseCommaTags(typeof tagsRaw === 'string' ? tagsRaw : null));

  const mediaDir = join(process.cwd(), 'public', 'media');
  await mkdir(mediaDir, { recursive: true });

  const stem = toSafeFileStem(fileEntry.name);
  const { diskPath, publicUrl } = await nextAvailableFilePath(mediaDir, stem, ext);

  const existing = await prisma.mediaAsset.findFirst({ where: { url: publicUrl } });
  if (existing) {
    return NextResponse.json({ asset: existing, duplicate: true });
  }

  const bytes = Buffer.from(await fileEntry.arrayBuffer());
  await writeFile(diskPath, bytes);

  const asset = await prisma.mediaAsset.create({
    data: {
      url: publicUrl,
      alt,
      tags,
      mimeType,
    },
  });

  return NextResponse.json({ asset }, { status: 201 });
}
