import { z } from 'zod';
import { validateCmsRichTextField } from '@/lib/cms/rich-text';
import { isCmsBlockType, type CmsBlockType } from '@/lib/cms/page-registry';
import { SHOWCASE_ICON_KEYS } from '@/lib/solution-showcase-data';

const draftObject = z.record(z.string(), z.unknown());

type Refine = (o: Record<string, unknown>) => string | null;

const showcaseIconSet = new Set<string>(SHOWCASE_ICON_KEYS);

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
  coverageCarousel: (o) => {
    if (o.items === undefined || o.items === null) return null;
    if (!Array.isArray(o.items)) return 'coverageCarousel: items must be an array';
    for (const it of o.items) {
      if (typeof it === 'string') continue;
      if (!it || typeof it !== 'object' || Array.isArray(it)) return 'coverageCarousel: invalid item';
      const row = it as Record<string, unknown>;
      if (typeof row.title !== 'string' || !row.title.trim()) return 'coverageCarousel: each item needs a non-empty title';
      if (row.desc !== undefined && row.desc !== null) {
        const e = validateCmsRichTextField(row.desc);
        if (e) return e;
      }
    }
    return null;
  },
  directoryGrid: (o) => {
    if (!Array.isArray(o.items)) return 'directoryGrid: items (array) required';
    if (o.subheading !== undefined && o.subheading !== null) {
      const e = validateCmsRichTextField(o.subheading);
      if (e) return e;
    }
    return validateEachRichField(o.items, 'description');
  },
  solutionShowcase: (o) => {
    if (typeof o.title !== 'string') return 'solutionShowcase: title (string) required';
    if (o.titleGradient !== undefined && o.titleGradient !== null && typeof o.titleGradient !== 'string') {
      return 'solutionShowcase: titleGradient must be a string';
    }
    if (typeof o.subtitle !== 'string') return 'solutionShowcase: subtitle (string) required';
    const pc = o.primaryCta;
    const sc = o.secondaryCta;
    const ctaOk = (x: unknown) =>
      x !== null &&
      typeof x === 'object' &&
      !Array.isArray(x) &&
      typeof (x as { label?: unknown }).label === 'string' &&
      typeof (x as { href?: unknown }).href === 'string';
    if (!ctaOk(pc)) return 'solutionShowcase: primaryCta with label and href required';
    if (!ctaOk(sc)) return 'solutionShowcase: secondaryCta with label and href required';
    if (!Array.isArray(o.verticals) || o.verticals.length === 0) {
      return 'solutionShowcase: verticals (non-empty array) required';
    }
    for (const vert of o.verticals) {
      if (!vert || typeof vert !== 'object' || Array.isArray(vert)) return 'solutionShowcase: invalid vertical';
      const v = vert as Record<string, unknown>;
      for (const key of ['id', 'label', 'panelTitle', 'panelDescription'] as const) {
        if (typeof v[key] !== 'string' || !String(v[key]).trim()) {
          return `solutionShowcase: vertical.${key} (non-empty string) required`;
        }
      }
      if (!Array.isArray(v.cards)) return 'solutionShowcase: vertical.cards (array) required';
      for (const card of v.cards) {
        if (!card || typeof card !== 'object' || Array.isArray(card)) return 'solutionShowcase: invalid card';
        const c = card as Record<string, unknown>;
        if (typeof c.icon !== 'string' || !showcaseIconSet.has(c.icon)) {
          return 'solutionShowcase: card.icon must be a known icon key';
        }
        if (typeof c.title !== 'string' || !c.title.trim()) return 'solutionShowcase: card.title required';
        if (typeof c.description !== 'string') return 'solutionShowcase: card.description required';
      }
    }
    return null;
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
