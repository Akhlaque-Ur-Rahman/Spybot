/** Derives a URL-style page key from a human title (for new pages when no code is given). */
export function suggestCmsPageKeyFromTitle(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!base) return 'new-page';
  return base.length > 80 ? base.slice(0, 80) : base;
}
