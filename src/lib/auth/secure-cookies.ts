/**
 * Must stay in sync with `useSecureCookies` in `authOptions`.
 * Middleware `getToken` defaults `secureCookie` from `NEXTAUTH_URL?.startsWith('https')` only,
 * which misses the production + non-http-URL case and reads the wrong session cookie name.
 */
export function nextAuthUseSecureCookies(): boolean {
  const nextAuthUrl = process.env.NEXTAUTH_URL ?? '';
  return (
    nextAuthUrl.startsWith('https://') ||
    (process.env.NODE_ENV === 'production' && !nextAuthUrl.startsWith('http://'))
  );
}
