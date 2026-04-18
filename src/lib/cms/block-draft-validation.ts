import { z } from 'zod';
import { validateCmsRichTextField } from '@/lib/cms/rich-text';
import { isCmsBlockType, type CmsBlockType } from '@/lib/cms/page-registry';

const draftObject = z.record(z.string(), z.unknown());

type Refine = (o: Record<string, unknown>) => string | null;

function validateEachRichField(items: unknown, key: 'desc' | 'description'): string | null {
  if (!Array.isArray(items)) return null;
  for (const raw of items) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return 'invalid item';
    const v = (raw as Record<string, unknown>)[key];
    const err = validateCmsRichTextField(v);
    if (err) return err;
  }
  return null;
}

const refinements: Record<CmsBlockType, Refine> = {
  hero: (o) => {
    if (typeof o.headline !== 'string') return 'hero: headline (string) required';
    for (const key of ['subheadline', 'riskSummary'] as const) {
      const err = validateCmsRichTextField(o[key]);
      if (err) return err;
    }
    return null;
  },
  pageHeader: (o) => {
    if (typeof o.title !== 'string') return 'pageHeader: title (string) required';
    if (o.description === undefined || o.description === null) return null;
    return validateCmsRichTextField(o.description);
  },
  coverageCarousel: () => null,
  directoryGrid: (o) => {
    if (!Array.isArray(o.items)) return 'directoryGrid: items (array) required';
    if (o.subheading !== undefined && o.subheading !== null) {
      const e = validateCmsRichTextField(o.subheading);
      if (e) return e;
    }
    return validateEachRichField(o.items, 'description');
  },
  sliderSection: (o) => {
    if (typeof o.heading !== 'string' || !Array.isArray(o.items)) {
      return 'sliderSection: heading (string) and items (array) required';
    }
    return validateEachRichField(o.items, 'desc');
  },
  utilityCtaBand: (o) => {
    const p = o.primary;
    const ok =
      typeof o.title === 'string' &&
      p !== null &&
      typeof p === 'object' &&
      !Array.isArray(p) &&
      typeof (p as { label?: unknown }).label === 'string';
    if (!ok) return 'utilityCtaBand: title and primary.label required';
    if (o.description !== undefined && o.description !== null) {
      const e = validateCmsRichTextField(o.description);
      if (e) return e;
    }
    return null;
  },
  faqAccordion: (o) => {
    if (!Array.isArray(o.groups)) return 'faqAccordion: groups (array) required';
    for (const g of o.groups) {
      if (!g || typeof g !== 'object' || Array.isArray(g)) return 'faqAccordion: invalid group';
      const items = (g as { items?: unknown }).items;
      if (!Array.isArray(items)) return 'faqAccordion: group.items must be an array';
      for (const it of items) {
        if (!it || typeof it !== 'object' || Array.isArray(it)) return 'faqAccordion: invalid item';
        const row = it as { q?: unknown; a?: unknown };
        if (typeof row.q !== 'string') return 'faqAccordion: question must be a string';
        const err = validateCmsRichTextField(row.a);
        if (err) return err;
      }
    }
    return null;
  },
  supportPathways: (o) => {
    if (typeof o.heading !== 'string' || !Array.isArray(o.pathways)) {
      return 'supportPathways: heading and pathways required';
    }
    const e = validateCmsRichTextField(o.subheading);
    if (e) return e;
    return validateEachRichField(o.pathways, 'desc');
  },
  supportSlaStrip: (o) =>
    typeof o.heading === 'string' && Array.isArray(o.cards) ? null : 'supportSlaStrip: heading and cards required',
  resourceGrid: (o) => {
    if (typeof o.heading !== 'string' || !Array.isArray(o.tiles)) {
      return 'resourceGrid: heading and tiles required';
    }
    return validateEachRichField(o.tiles, 'desc');
  },
  contactHighlights: (o) => {
    if (typeof o.heading !== 'string' || !Array.isArray(o.items)) {
      return 'contactHighlights: heading and items required';
    }
    return validateEachRichField(o.items, 'desc');
  },
  benefits: (o) => {
    if (!Array.isArray(o.items)) return 'benefits: items (array) required';
    if (o.subtitle !== undefined && o.subtitle !== null) {
      const e = validateCmsRichTextField(o.subtitle);
      if (e) return e;
    }
    return validateEachRichField(o.items, 'desc');
  },
  challenges: (o) => {
    if (!Array.isArray(o.items)) return 'challenges: items (array) required';
    if (o.subtitle !== undefined && o.subtitle !== null) {
      const e = validateCmsRichTextField(o.subtitle);
      if (e) return e;
    }
    return validateEachRichField(o.items, 'desc');
  },
  lifecycle: (o) => {
    if (!Array.isArray(o.steps)) return 'lifecycle: steps (array) required';
    if (o.subtitle !== undefined && o.subtitle !== null) {
      const e = validateCmsRichTextField(o.subtitle);
      if (e) return e;
    }
    return validateEachRichField(o.steps, 'desc');
  },
  decisionFlow: (o) => {
    if (typeof o.title !== 'string' || !Array.isArray(o.decisions)) {
      return 'decisionFlow: title and decisions required';
    }
    for (const key of ['subtitle', 'noteText'] as const) {
      const err = validateCmsRichTextField(o[key]);
      if (err) return err;
    }
    const caps = o.capabilities;
    if (caps !== undefined) {
      if (!Array.isArray(caps)) return 'decisionFlow: capabilities must be an array';
      const err = validateEachRichField(caps, 'desc');
      if (err) return err;
    }
    return null;
  },
  demoSection: (o) => {
    if (typeof o.title !== 'string' || !Array.isArray(o.formFields)) {
      return 'demoSection: title and formFields required';
    }
    for (const key of ['subtitle', 'formNote', 'successText', 'socialProofText', 'socialProofSubtext'] as const) {
      const err = validateCmsRichTextField(o[key]);
      if (err) return err;
    }
    const vp = o.valuePoints;
    if (vp !== undefined) {
      if (!Array.isArray(vp)) return 'demoSection: valuePoints must be an array';
      const err = validateEachRichField(vp, 'desc');
      if (err) return err;
    }
    return null;
  },
};

export function validateBlockDraftJson(
  blockType: string,
  draftJson: unknown,
): { ok: true } | { ok: false; error: string } {
  const parsed = draftObject.safeParse(draftJson);
  if (!parsed.success) {
    return { ok: false, error: 'Block draft must be a JSON object' };
  }
  if (!isCmsBlockType(blockType)) {
    return { ok: true };
  }
  const msg = refinements[blockType](parsed.data);
  if (msg) return { ok: false, error: msg };
  return { ok: true };
}
