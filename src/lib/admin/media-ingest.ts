import { extname } from 'node:path';

const UPLOADABLE_MIME_PREFIXES = ['image/', 'video/', 'audio/'] as const;
const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.pdf': 'application/pdf',
};

export const MEDIA_MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

export function inferMimeTypeFromPath(pathname: string): string | null {
  const ext = extname(pathname).toLowerCase();
  return MIME_BY_EXT[ext] ?? null;
}

export function isAllowedMediaMimeType(mimeType: string): boolean {
  const mime = mimeType.trim().toLowerCase();
  if (mime === 'application/pdf') return true;
  return UPLOADABLE_MIME_PREFIXES.some((prefix) => mime.startsWith(prefix));
}

export function normalizeMediaTags(tags: string[] | undefined): string[] {
  if (!tags?.length) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of tags) {
    const tag = raw.trim().slice(0, 64);
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
    if (out.length >= 50) break;
  }
  return out;
}

export function toSafeFileStem(filename: string): string {
  const stem = filename.replace(/\.[^.]+$/, '').trim().toLowerCase();
  const cleaned = stem.replace(/[^a-z0-9_-]+/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '');
  return cleaned || 'asset';
}
