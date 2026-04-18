import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeSiteRuntimeConfig, validateSiteRuntimeSettingsJson } from '@/lib/cms/site-runtime-config';

test('mergeSiteRuntimeConfig applies overrides', () => {
  const merged = mergeSiteRuntimeConfig({ siteName: 'Acme', siteUrl: 'https://acme.test' });
  assert.equal(merged.siteName, 'Acme');
  assert.equal(merged.siteUrl, 'https://acme.test');
  assert.ok(merged.keywords.length > 0);
});

test('mergeSiteRuntimeConfig ignores invalid json shape', () => {
  const merged = mergeSiteRuntimeConfig({ siteName: 123 });
  assert.equal(typeof merged.siteName, 'string');
});

test('validateSiteRuntimeSettingsJson rejects wrong types', () => {
  const bad = validateSiteRuntimeSettingsJson({ siteName: 123 });
  assert.equal(bad.ok, false);
  if (!bad.ok) assert.match(bad.error, /siteName/i);
});

test('validateSiteRuntimeSettingsJson accepts empty object', () => {
  assert.deepEqual(validateSiteRuntimeSettingsJson({}), { ok: true });
});
