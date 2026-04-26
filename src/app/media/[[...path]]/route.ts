import { createReadStream } from 'node:fs';
import { open } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { Readable } from 'node:stream';
import { stat } from 'node:fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { inferMimeTypeFromPath } from '@/lib/admin/media-ingest';

const CACHE_CONTROL = 'public, max-age=3600, stale-while-revalidate=86400';

function mediaRootDir(): string {
  return resolve(join(/* turbopackIgnore: true */ process.cwd(), 'public', 'media'));
}

function safeResolvedFilePath(segments: string[] | undefined): string | null {
  if (!segments?.length) return null;
  for (const s of segments) {
    if (!s || s === '.' || s === '..') return null;
  }
  const base = mediaRootDir();
  const filePath = resolve(base, ...segments);
  const rel = relative(base, filePath);
  if (rel.startsWith('..') || rel === '') return null;
  return filePath;
}

type RangeResult =
  | { kind: 'full' }
  | { kind: 'unsatisfiable' }
  | { kind: 'partial'; start: number; end: number };

function parseRangeHeader(size: number, rangeHeader: string): RangeResult {
  if (size === 0) {
    return { kind: 'full' };
  }
  const m = /^\s*bytes=(\d*)-(\d*)\s*$/i.exec(rangeHeader);
  if (!m) {
    return { kind: 'full' };
  }
  if (m[1] === '' && m[2] !== '') {
    const n = parseInt(m[2], 10);
    if (Number.isNaN(n) || n < 0) return { kind: 'full' };
    const start = Math.max(0, size - n);
    return { kind: 'partial', start, end: size - 1 };
  }
  const start = m[1] === '' ? 0 : parseInt(m[1], 10);
  const end = m[2] === '' ? size - 1 : parseInt(m[2], 10);
  if (Number.isNaN(start) || Number.isNaN(end)) return { kind: 'full' };
  if (start < 0 || end < 0 || start >= size) {
    return { kind: 'unsatisfiable' };
  }
  const endClamped = Math.min(end, size - 1);
  if (start > endClamped) {
    return { kind: 'unsatisfiable' };
  }
  return { kind: 'partial', start, end: endClamped };
}

type Props = { params: Promise<{ path?: string[] }> };

export async function GET(request: NextRequest, context: Props): Promise<NextResponse> {
  const { path: segments } = await context.params;
  const filePath = safeResolvedFilePath(segments);
  if (!filePath) {
    return new NextResponse('Not found', { status: 404 });
  }

  let s;
  try {
    s = await stat(filePath);
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
  if (!s.isFile()) {
    return new NextResponse('Not found', { status: 404 });
  }

  const { size } = s;
  const mime = inferMimeTypeFromPath(filePath) ?? 'application/octet-stream';
  const nameForMime = `/${(segments ?? []).join('/')}`;

  const rangeHeader = request.headers.get('range');
  if (!rangeHeader) {
    const body = Readable.toWeb(createReadStream(filePath)) as ReadableStream<Uint8Array>;
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': inferMimeTypeFromPath(nameForMime) ?? mime,
        'Content-Length': String(size),
        'Accept-Ranges': 'bytes',
        'Cache-Control': CACHE_CONTROL,
      },
    });
  }

  if (rangeHeader.includes(',')) {
    const body = Readable.toWeb(createReadStream(filePath)) as ReadableStream<Uint8Array>;
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': inferMimeTypeFromPath(nameForMime) ?? mime,
        'Content-Length': String(size),
        'Accept-Ranges': 'bytes',
        'Cache-Control': CACHE_CONTROL,
      },
    });
  }

  const parsed = parseRangeHeader(size, rangeHeader);
  if (parsed.kind === 'unsatisfiable') {
    return new NextResponse(null, {
      status: 416,
      headers: { 'Content-Range': `bytes */${size}` },
    });
  }
  if (parsed.kind === 'full') {
    const body = Readable.toWeb(createReadStream(filePath)) as ReadableStream<Uint8Array>;
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': inferMimeTypeFromPath(nameForMime) ?? mime,
        'Content-Length': String(size),
        'Accept-Ranges': 'bytes',
        'Cache-Control': CACHE_CONTROL,
      },
    });
  }

  const { start, end } = parsed;
  const contentLength = end - start + 1;
  const fileHandle = await open(filePath, 'r');
  const nodeStream = fileHandle.createReadStream({ start, end, autoClose: true });
  const body = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;

  return new NextResponse(body, {
    status: 206,
    headers: {
      'Content-Type': inferMimeTypeFromPath(nameForMime) ?? mime,
      'Content-Length': String(contentLength),
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Cache-Control': CACHE_CONTROL,
    },
  });
}
