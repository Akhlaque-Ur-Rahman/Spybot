import test from 'node:test';
import assert from 'node:assert/strict';
import { isReservedPublicPath, pathFromOptionalCatchAllSegments } from '@/lib/cms/reserved-public-segments';

test('pathFromOptionalCatchAllSegments', () => {
  assert.equal(pathFromOptionalCatchAllSegments(undefined), '/');
  assert.equal(pathFromOptionalCatchAllSegments(['a', 'b']), '/a/b');
});

test('isReservedPublicPath', () => {
  assert.equal(isReservedPublicPath(['admin']), true);
  assert.equal(isReservedPublicPath(['solutions']), false);
});
