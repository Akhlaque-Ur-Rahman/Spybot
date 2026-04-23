import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  computeOverflowStartIndex,
  normalizeHeaderDropdownConfig,
} from '@/lib/cms/navigation-utils';

describe('normalizeHeaderDropdownConfig', () => {
  test('returns empty groups for invalid values', () => {
    const normalized = normalizeHeaderDropdownConfig(null);
    assert.deepEqual(normalized, {
      company: [],
      industries: [],
      solution: [],
      resources: [],
    });
  });

  test('keeps only valid nav items', () => {
    const normalized = normalizeHeaderDropdownConfig({
      company: [{ label: ' About ', href: '/about', description: ' About page ' }, { label: '', href: '/x' }],
      industries: [{ label: 'Fintech', href: '/industries/fintech' }],
      solution: [{ label: 'Identity', href: '' }],
      resources: 'invalid',
      'Case Studies': [{ label: 'Story', href: '/resources/story' }],
    });

    assert.deepEqual(normalized.company, [{ label: 'About', href: '/about', description: 'About page' }]);
    assert.deepEqual(normalized.industries, [{ label: 'Fintech', href: '/industries/fintech', description: null }]);
    assert.deepEqual(normalized.solution, []);
    assert.deepEqual(normalized.resources, []);
    assert.deepEqual(normalized['case studies'], [{ label: 'Story', href: '/resources/story', description: null }]);
  });
});

describe('computeOverflowStartIndex', () => {
  test('returns null when all items fit', () => {
    const result = computeOverflowStartIndex([90, 100, 95], 400, 92);
    assert.equal(result, null);
  });

  test('returns cutoff when overflow is required', () => {
    const result = computeOverflowStartIndex([110, 120, 130, 140], 360, 92);
    assert.equal(result, 2);
  });
});
