import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCmsPageSlug } from '@/lib/cms/service';
import { validatePublicCmsSlugInput } from '@/lib/cms/slug-validation';

test('validatePublicCmsSlugInput rejects admin prefix', () => {
  assert.equal(validatePublicCmsSlugInput('/admin'), 'Path conflicts with a reserved route');
});

test('validatePublicCmsSlugInput accepts marketing path', () => {
  assert.equal(validatePublicCmsSlugInput('/legal/terms'), null);
});

test('validatePublicCmsSlugInput rejects fixed routes', () => {
  assert.equal(
    validatePublicCmsSlugInput('/contact'),
    'Path conflicts with a fixed site route'
  );
});

test('validatePublicCmsSlugInput allows exempt static slug for built-in pages', () => {
  assert.equal(validatePublicCmsSlugInput('/contact', '/contact'), null);
});

test('normalizeCmsPageSlug collapses slashes and trailing slash', () => {
  assert.equal(normalizeCmsPageSlug('//a//b//'), '/a/b');
  assert.equal(normalizeCmsPageSlug('/x/'), '/x');
});
