import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  canonicalMenuLabel,
  computeOverflowStartIndex,
  filterOverflowNavGroups,
  hasNavDropdownItems,
  normalizeHeaderDropdownConfig,
  resolveNavDropdownItems,
} from '@/lib/cms/navigation-utils';
describe('canonicalMenuLabel', () => {
  test('does not treat Home / as Company', () => {
    assert.equal(canonicalMenuLabel({ label: 'Home', href: '/' }), null);
    assert.equal(canonicalMenuLabel({ label: 'Home', href: '/home' }), null);
  });

  test('maps canonical menus by label', () => {
    assert.equal(canonicalMenuLabel({ label: 'Solutions', href: '/solutions' }), 'Solution');
    assert.equal(canonicalMenuLabel({ label: 'Company', href: '/' }), 'Company');
  });
});

describe('resolveNavDropdownItems', () => {
  const defaults = {
    Company: [{ label: 'About Us', href: '/about-us' }],
    Industries: [{ label: 'Fintech', href: '/industries/fintech' }],
    Solution: [{ label: 'Identity Verification', href: '/solutions/identity-verification' }],
    Resources: [{ label: 'Blog', href: '/blog' }],
  };

  test('uses CMS items only and does not prepend code defaults', () => {
    const result = resolveNavDropdownItems(
      { label: 'Solutions', href: '/solutions' },
      'Solution',
      {
        company: [],
        industries: [],
        solution: [{ label: 'Face Recognition', href: '/face-recognition' }],
        resources: [],
      },
      defaults
    );
    assert.deepEqual(result, [{ label: 'Face Recognition', href: '/face-recognition' }]);
  });

  test('does not revive code defaults when CMS group is empty', () => {
    const result = resolveNavDropdownItems(
      { label: 'Industries', href: '/industries' },
      'Industries',
      {
        company: [],
        industries: [],
        solution: [],
        resources: [],
      },
      defaults
    );
    assert.equal(result, undefined);
  });

  test('uses insurance CMS group for a custom top-level item', () => {
    const result = resolveNavDropdownItems(
      { label: 'Insurance', href: '/industries/insurance' },
      null,
      {
        company: [],
        industries: [],
        solution: [],
        resources: [],
        insurance: [{ label: 'Motor-OD', href: '/motor-od' }],
      },
      defaults
    );
    assert.deepEqual(result, [{ label: 'Motor-OD', href: '/motor-od' }]);
  });
});

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

describe('filterOverflowNavGroups', () => {
  test('treats missing or empty dropdowns as no group', () => {
    assert.equal(hasNavDropdownItems(undefined), false);
    assert.equal(hasNavDropdownItems(null), false);
    assert.equal(hasNavDropdownItems([]), false);
    assert.equal(hasNavDropdownItems([{ label: 'FAQs', href: '/faqs' }]), true);
  });

  test('omits overflow groups that have no child links', () => {
    const result = filterOverflowNavGroups([
      { label: 'Industries', href: '/industries', dropdown: undefined },
      { label: 'Resources', href: '/resources', dropdown: [] },
      {
        label: 'Staffing',
        href: '/staffing',
        dropdown: [{ label: 'Employee Background Check', href: '/staffing/background-check' }],
      },
    ]);
    assert.deepEqual(
      result.map((item) => item.label),
      ['Staffing']
    );
  });
});
