import { isCmsBlockType } from '@/lib/cms/page-registry';
import { stableStringify } from '@/lib/cms/json-stable';
import { validateBlockDraftJson } from '@/lib/cms/block-draft-validation';

type PageWithBlocks = {
  key: string;
  sections: Array<{
    key: string;
    label: string;
    blocks: Array<{
      id: string;
      key: string;
      type: string;
      draftJson: unknown;
      liveJson: unknown;
    }>;
  }>;
};

export type PublishPreflightIssue = {
  severity: 'error' | 'warning';
  message: string;
  sectionKey?: string;
  blockKey?: string;
};

export type PublishPreflightReport = {
  pageKey: string;
  ok: boolean;
  errors: PublishPreflightIssue[];
  warnings: PublishPreflightIssue[];
  dirtyBlocks: number;
};

export function runPublishPreflight(page: PageWithBlocks): PublishPreflightReport {
  const errors: PublishPreflightIssue[] = [];
  const warnings: PublishPreflightIssue[] = [];
  let dirtyBlocks = 0;

  if (!page.sections.length) {
    errors.push({
      severity: 'error',
      message: 'Page has no sections. Add at least one section before publish.',
    });
  }

  for (const section of page.sections) {
    if (!section.blocks.length) {
      errors.push({
        severity: 'error',
        message: 'Section has no blocks. Add at least one block before publish.',
        sectionKey: section.key,
      });
      continue;
    }

    for (const block of section.blocks) {
      if (stableStringify(block.draftJson) !== stableStringify(block.liveJson)) {
        dirtyBlocks += 1;
      }

      const validity = validateBlockDraftJson(block.type, block.draftJson);
      if (!validity.ok) {
        errors.push({
          severity: 'error',
          message: validity.error,
          sectionKey: section.key,
          blockKey: block.key,
        });
        continue;
      }

      if (!isCmsBlockType(block.type)) {
        warnings.push({
          severity: 'warning',
          message: `Block type "${block.type}" is not recognized by the typed CMS schema.`,
          sectionKey: section.key,
          blockKey: block.key,
        });
      }
    }
  }

  return {
    pageKey: page.key,
    ok: errors.length === 0,
    errors,
    warnings,
    dirtyBlocks,
  };
}
