import { cookies } from 'next/headers';

export const CMS_PREVIEW_EXPIRES_COOKIE = 'cms_preview_expires_at';
const ENV_TTL = Number(process.env.CMS_PREVIEW_TTL_SECONDS ?? '1200');
export const CMS_PREVIEW_MAX_AGE_SEC = Number.isFinite(ENV_TTL)
  ? Math.max(60, Math.min(24 * 60 * 60, Math.floor(ENV_TTL)))
  : 20 * 60;

export function getPreviewExpiryIso(now = Date.now(), maxAgeSec = CMS_PREVIEW_MAX_AGE_SEC): string {
  return new Date(now + maxAgeSec * 1000).toISOString();
}

export async function isCmsPreviewSessionActive(now = Date.now()): Promise<boolean> {
  const store = await cookies();
  const raw = store.get(CMS_PREVIEW_EXPIRES_COOKIE)?.value;
  if (!raw) return false;
  const expiry = Date.parse(raw);
  if (!Number.isFinite(expiry)) return false;
  return expiry > now;
}
