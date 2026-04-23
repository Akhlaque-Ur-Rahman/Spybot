import { defaultDraftForBlockType } from '@/lib/cms/default-block-drafts';
import type { CmsBlockType } from '@/lib/cms/page-registry';
import { CMS_BLOCK_TYPE_LABELS } from '@/lib/cms/page-registry';

export type CmsSectionTemplate = {
  id: string;
  blockType: CmsBlockType;
  title: string;
  suggestedKey: string;
  suggestedLabel: string;
};

function labelForBlockType(type: CmsBlockType): string {
  return CMS_BLOCK_TYPE_LABELS[type] ?? type;
}

function defaultSuggestedKey(type: CmsBlockType): string {
  return type;
}

/**
 * Starter section templates for the CMS: one per block type, using the same draft JSON as
 * {@link defaultDraftForBlockType} (extend here later for variant drafts).
 */
export const CMS_SECTION_TEMPLATES: readonly CmsSectionTemplate[] = (
  [
    'hero',
    'pageHeader',
    'coverageCarousel',
    'directoryGrid',
    'solutionShowcase',
    'fintechHero',
    'fintechWhy',
    'fintechLogoStrip',
    'fintechFaqSplit',
    'fintechSpotlight',
    'fintechCtaBanner',
    'fintechApiKey',
    'sliderSection',
    'utilityCtaBand',
    'faqAccordion',
    'supportPathways',
    'supportSlaStrip',
    'resourceGrid',
    'contactHighlights',
    'benefits',
    'challenges',
    'lifecycle',
    'decisionFlow',
    'demoSection',
  ] as const
).map((blockType) => ({
  id: blockType,
  blockType,
  title: labelForBlockType(blockType),
  suggestedKey: defaultSuggestedKey(blockType),
  suggestedLabel: labelForBlockType(blockType),
}));

const templateById = new Map(CMS_SECTION_TEMPLATES.map((t) => [t.id, t]));

export function getSectionTemplateById(id: string): CmsSectionTemplate | undefined {
  return templateById.get(id);
}

/** Draft JSON for a new block when this template is used (same defaults as adding a section by type). */
export function getSectionTemplateDraftJson(templateId: string): unknown {
  const t = getSectionTemplateById(templateId);
  if (!t) return undefined;
  return defaultDraftForBlockType(t.blockType);
}

export function isSectionTemplateId(id: string): boolean {
  return templateById.has(id);
}
