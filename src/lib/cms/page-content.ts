import { draftMode } from 'next/headers';
import { getCmsPageByKey, getCmsPageBySlug, normalizeCmsPageSlug } from '@/lib/cms/service';
import type { CmsPage } from '@/lib/cms/types';
import {
  cmsRegistryPages,
  getCmsRegistryPageBySlug,
  isCmsBlockType,
  type CmsBlockType,
  type CmsBlockValueMap,
  type CmsRegistryBlock,
  type CmsRegistryPage,
} from '@/lib/cms/page-registry';

type ManagedBlock<T extends CmsBlockType = CmsBlockType> = {
  key: string;
  type: T;
  position: number;
  value: CmsBlockValueMap[T];
};

type ManagedSection = {
  key: string;
  label: string;
  position: number;
  blocks: ManagedBlock[];
};

export type ManagedCmsPage = {
  key: string;
  title: string;
  slug: string;
  status: string;
  seoTitle: string;
  seoDescription: string;
  sections: ManagedSection[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toManagedBlock(blockDef: CmsRegistryBlock, valueOverride?: unknown): ManagedBlock {
  const value = isRecord(valueOverride)
    ? (valueOverride as CmsBlockValueMap[typeof blockDef.type])
    : blockDef.value;
  return {
    key: blockDef.key,
    type: blockDef.type,
    position: blockDef.position,
    value,
  };
}

function fromRegistryPage(page: CmsRegistryPage): ManagedCmsPage {
  return {
    key: page.key,
    title: page.title,
    slug: page.slug,
    status: 'published',
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    sections: page.sections.map((section) => ({
      key: section.key,
      label: section.label,
      position: section.position,
      blocks: section.blocks.map((block) => toManagedBlock(block)),
    })),
  };
}

function managedBlockFromDbRow(
  block: CmsPage['sections'][number]['blocks'][number],
  useDraft: boolean
): ManagedBlock | null {
  if (!isCmsBlockType(block.type)) return null;
  const t = block.type;
  const raw = useDraft ? block.draftJson : block.liveJson;
  const value = isRecord(raw)
    ? (raw as CmsBlockValueMap[typeof t])
    : ({} as CmsBlockValueMap[typeof t]);
  return {
    key: block.key,
    type: t,
    position: block.position,
    value,
  };
}

function managedSectionFromDbRow(
  sec: CmsPage['sections'][number],
  useDraft: boolean
): ManagedSection {
  return {
    key: sec.key,
    label: sec.label,
    position: sec.position,
    blocks: sec.blocks
      .map((b) => managedBlockFromDbRow(b, useDraft))
      .filter((b): b is ManagedBlock => b !== null),
  };
}

/** Full page from DB only (no registry template). */
function fromDbOnlyManagedPage(dbPage: CmsPage, useDraft: boolean): ManagedCmsPage {
  const seoTitle =
    dbPage.seoTitle && String(dbPage.seoTitle).trim() !== '' ? dbPage.seoTitle : dbPage.title;
  return {
    key: dbPage.key,
    title: dbPage.title,
    slug: dbPage.slug,
    status: dbPage.status,
    seoTitle: seoTitle ?? dbPage.title,
    seoDescription: dbPage.seoDescription ?? '',
    sections: [...dbPage.sections]
      .sort((a, b) => a.position - b.position)
      .map((s) => managedSectionFromDbRow(s, useDraft)),
  };
}

function mergeRegistryWithDb(
  registryPage: CmsRegistryPage,
  dbPage: CmsPage,
  useDraft: boolean
): ManagedCmsPage {
  const base = fromRegistryPage(registryPage);
  const applyDbMetadata = useDraft || dbPage.status === 'published';

  const mergedBaseSections = base.sections.map((section) => {
    const dbSection = dbPage.sections.find((item) => item.key === section.key);
    if (!dbSection) return section;

    if (!applyDbMetadata) {
      return {
        key: section.key,
        label: section.label,
        position: section.position,
        blocks: section.blocks,
      };
    }

    return {
      key: section.key,
      label: dbSection.label || section.label,
      position: section.position,
      blocks: section.blocks.map((block) => {
        const dbBlock = dbSection.blocks.find((item) => item.key === block.key);
        if (!dbBlock || dbBlock.type !== block.type || !isCmsBlockType(dbBlock.type)) return block;
        return {
          ...block,
          type: dbBlock.type as CmsBlockType,
          value: isRecord(useDraft ? dbBlock.draftJson : dbBlock.liveJson)
            ? ((useDraft ? dbBlock.draftJson : dbBlock.liveJson) as CmsBlockValueMap[typeof block.type])
            : block.value,
        };
      }),
    };
  });

  const baseKeys = new Set(base.sections.map((s) => s.key));
  const extraDbSections = applyDbMetadata
    ? dbPage.sections
        .filter((s) => !baseKeys.has(s.key))
        .sort((a, b) => a.position - b.position)
        .map((s) => managedSectionFromDbRow(s, useDraft))
    : [];

  return {
    key: dbPage.key,
    title: applyDbMetadata ? dbPage.title : registryPage.title,
    slug: applyDbMetadata ? dbPage.slug : registryPage.slug,
    status: dbPage.status,
    seoTitle: applyDbMetadata ? (dbPage.seoTitle ?? registryPage.seoTitle) : registryPage.seoTitle,
    seoDescription: applyDbMetadata
      ? (dbPage.seoDescription ?? registryPage.seoDescription)
      : registryPage.seoDescription,
    sections: [...mergedBaseSections, ...extraDbSections],
  };
}

export async function getManagedPageBySlug(slug: string): Promise<ManagedCmsPage | null> {
  const pathSlug = normalizeCmsPageSlug(slug);
  const registryPage =
    getCmsRegistryPageBySlug(pathSlug) ?? getCmsRegistryPageBySlug(slug.trim()) ?? null;

  let dbPage: CmsPage | null = null;
  if (registryPage) {
    const byKey = await getCmsPageByKey(registryPage.key);
    const bySlug = await getCmsPageBySlug(pathSlug);
    if (byKey && bySlug && byKey.id !== bySlug.id) {
      dbPage = byKey;
    } else {
      dbPage = byKey ?? bySlug;
    }
    if (dbPage && dbPage.key !== registryPage.key) {
      dbPage = null;
    }
  } else {
    dbPage = await getCmsPageBySlug(pathSlug);
  }

  if (!registryPage && !dbPage) return null;

  const mode = await draftMode();
  const useDraft = mode.isEnabled;

  if (!registryPage) {
    if (!dbPage) return null;
    if (!useDraft && dbPage.status === 'draft') {
      return null;
    }
    return fromDbOnlyManagedPage(dbPage, useDraft);
  }

  const base = fromRegistryPage(registryPage);

  if (!dbPage) return base;

  return mergeRegistryWithDb(registryPage, dbPage, useDraft);
}

export async function getManagedPageByKey(key: string): Promise<ManagedCmsPage | null> {
  const registryHit = cmsRegistryPages.find((item) => item.key === key);
  if (registryHit) return getManagedPageBySlug(registryHit.slug);
  const db = await getCmsPageByKey(key);
  if (!db) return null;
  return getManagedPageBySlug(db.slug);
}

export async function getManagedPageSeoBySlug(slug: string) {
  const page = await getManagedPageBySlug(slug);
  if (!page) return null;
  return {
    title: page.seoTitle,
    description: page.seoDescription,
  };
}

export function getManagedBlock<T extends CmsBlockType>(
  page: ManagedCmsPage | null,
  sectionKey: string,
  type: T,
  blockKey?: string
): CmsBlockValueMap[T] | null {
  const section = page?.sections.find((item) => item.key === sectionKey);
  if (!section) return null;
  const block = blockKey
    ? section.blocks.find((item) => item.key === blockKey && item.type === type)
    : section.blocks.find((item) => item.type === type);
  return (block?.value as CmsBlockValueMap[T] | undefined) ?? null;
}
