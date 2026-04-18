/**
 * Maps API / validation error strings to short, non-technical copy for toasts.
 * Unknown messages fall back to a generic line; log details separately in the console.
 */
export function adminApiErrorToUserMessage(technical: string, fallback = 'Something went wrong. Please try again.'): string {
  const t = technical.trim();
  if (!t) return fallback;

  const exact: Record<string, string> = {
    Unauthorized: 'You need to sign in again.',
    Forbidden: "You don't have permission to do that.",
    'Too many requests': 'Too many attempts. Please wait a moment and try again.',
    'Invalid CSRF token': 'Your session could not be verified. Refresh the page and try again.',
    'Not found': 'Nothing was found. It may have been removed.',
    'Page not found': 'That page could not be found.',
    'Page not found after publish': 'Publish did not complete. Refresh and try again.',
    'Block not found': 'That content block could not be found. Refresh the page.',
    'Version not found': 'That version could not be found.',
    'key is required': 'Please enter a page title and address, or open advanced options and add a page code.',
    'title is required': 'Please enter a page title.',
    'slug is required': 'Please enter a page address.',
    'Slug is required': 'Please enter a page address.',
    'Slug already in use': 'That page address is already in use. Try a different one.',
    'Page key already in use': 'That page code is already in use. Change the advanced page code or pick another title.',
    'A unique constraint was violated': 'Something already exists with those details. Try a small change and save again.',
    'This page key uses a fixed URL; slug must match that path.':
      'This page has a fixed web address. Use the address that belongs to this page type.',
    'Built-in pages cannot change their public path.': 'This built-in page cannot use a different web address.',
    'Use POST /api/admin/publish to publish; status cannot be set to published here.':
      'To go live, use Publish from the toolbar or the Publish area.',
    'Invalid status; only "draft" is allowed.': 'That status change is not allowed here.',
    'No updatable fields': 'Nothing to save. Change a field and try again.',
    'sectionKeys array is required': 'Something went wrong while saving order. Refresh and try again.',
    'sectionKeys must include every section on the page':
      'Something went wrong while saving order. Refresh and try again.',
    'Section key is required': 'Please enter a section code.',
    'Section label is required': 'Please enter a section name.',
    'Valid blockType is required': 'Please pick a block type.',
    'Section key already exists on this page': 'That section code is already used on this page.',
    'updates array required': 'Nothing was sent to save. Refresh and try again.',
    'Too many updates in one request': 'Too many changes at once. Save in smaller batches.',
    'draftJson required': 'Nothing to save for this block. Refresh and try again.',
    'columns object is required': 'Footer data was incomplete. Refresh and try again.',
    'Invalid JSON': 'The data could not be read. Check the format and try again.',
    'Invalid email, password, or role': 'Check the email, password, and role, then try again.',
    'Email already in use': 'That email is already in use.',
    'Path conflicts with a reserved route': 'This address is reserved and cannot be used for a page.',
    'Path conflicts with a fixed site route': 'This address is already used elsewhere on the site.',
    'Your content data is out of date. Refresh this page and try again.':
      'Your content data is out of date. Refresh this page and try again.',
    'We could not sync the website pages. Please try again in a moment.':
      'We could not import the default pages. Please try again in a moment.',
    'Value must be a JSON object': 'Site settings must be a single JSON object.',
  };

  if (exact[t]) return exact[t];

  if (t.startsWith('Unknown block id:')) return 'This page may have changed. Refresh and try again.';
  if (t.startsWith('Unknown section key:')) return 'This page may have changed. Refresh and try again.';

  if (t.includes('; ') && t.length < 400) {
    return 'Some values could not be saved. Check the form and try again.';
  }

  if (t.startsWith('Rich text')) return 'A text field could not be saved. Try simplifying the content.';
  if (t.includes('required') && t.includes(':')) return 'Some required information is missing or invalid.';

  return fallback;
}

export function adminFetchErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return adminApiErrorToUserMessage(error.message, fallback);
  }
  return fallback;
}

export function logAdminClientError(scope: string, error: unknown, extra?: Record<string, unknown>): void {
  if (extra && Object.keys(extra).length > 0) {
    console.error(`[admin-ui] ${scope}`, error, extra);
  } else {
    console.error(`[admin-ui] ${scope}`, error);
  }
}
