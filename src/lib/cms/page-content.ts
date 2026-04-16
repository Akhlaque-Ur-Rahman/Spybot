import { draftMode } from 'next/headers';
import { getPublishedPageBySlug } from '@/lib/cms/service';
import {
  cmsRegistryPages,
  getCmsRegistryPageBySlug,
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
  const value = isRecord(valueOverride) ? (valueOverride as CmsBlockValueMap[typeof blockDef.type]) : blockDef.value;
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

export async function getManagedPageBySlug(slug: string): Promise<ManagedCmsPage | null> {
  const registryPage = getCmsRegistryPageBySlug(slug);
  const dbPage = await getPublishedPageBySlug(slug);

  if (!registryPage && !dbPage) return null;
  if (!registryPage) {
    return {
      key: dbPage!.key,
      title: dbPage!.title,
      slug: dbPage!.slug,
      status: dbPage!.status,
      seoTitle: dbPage!.title,
      seoDescription: '',
      sections: [],
    };
  }

  const mode = await draftMode();
  const useDraft = mode.isEnabled;
  const base = fromRegistryPage(registryPage);

  if (!dbPage) return base;

  return {
    key: dbPage.key,
    title: dbPage.title,
    slug: dbPage.slug,
    status: dbPage.status,
    seoTitle: dbPage.seoTitle ?? registryPage.seoTitle,
    seoDescription: dbPage.seoDescription ?? registryPage.seoDescription,
    sections: base.sections.map((section) => {
      const dbSection = dbPage.sections.find((item) => item.key === section.key);
      if (!dbSection) return section;

      return {
        key: section.key,
        label: dbSection.label || section.label,
        position: section.position,
        blocks: section.blocks.map((block) => {
          const dbBlock = dbSection.blocks.find((item) => item.key === block.key || item.type === block.type);
          if (!dbBlock) return block;
          return {
            ...block,
            type: (dbBlock.type as CmsBlockType) || block.type,
            value: isRecord(useDraft ? dbBlock.draftJson : dbBlock.liveJson)
              ? ((useDraft ? dbBlock.draftJson : dbBlock.liveJson) as CmsBlockValueMap[typeof block.type])
              : block.value,
          };
        }),
      };
    }),
  };
}

export async function getManagedPageByKey(key: string): Promise<ManagedCmsPage | null> {
  const page = cmsRegistryPages.find((item) => item.key === key);
  if (!page) return null;
  return getManagedPageBySlug(page.slug);
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
  type: T
): CmsBlockValueMap[T] | null {
  const section = page?.sections.find((item) => item.key === sectionKey);
  const block = section?.blocks.find((item) => item.type === type);
  return (block?.value as CmsBlockValueMap[T] | undefined) ?? null;
}
