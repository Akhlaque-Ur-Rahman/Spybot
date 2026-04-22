import { SubmissionStatus, UserRole } from '@prisma/client';
import { z } from 'zod';
import { isCmsBlockType } from '@/lib/cms/page-registry';
import { getSectionTemplateById } from '@/lib/cms/section-templates';

const safeRelativePath = z
  .string()
  .max(2048)
  .optional()
  .refine(
    (s) => s === undefined || (s.startsWith('/') && !s.startsWith('//')),
    'Redirect must be a same-origin path'
  );

export const adminPublishPostSchema = z.object({
  pageKey: z.string().min(1).max(200).trim(),
  note: z.union([z.string().max(2000), z.null()]).optional(),
});

export const adminPublishRollbackSchema = z.object({
  pageId: z.string().cuid(),
  version: z.number().int().min(1).max(1_000_000),
});

export const adminPublishPreviewPostSchema = z.object({
  redirectTo: safeRelativePath,
});

export const adminMediaPostSchema = z.object({
  url: z.string().min(1).max(2048).trim(),
  alt: z.union([z.string().max(500), z.null()]).optional(),
  mimeType: z.union([z.string().max(200), z.null()]).optional(),
  tags: z.array(z.string().max(64).trim()).max(50).optional(),
});

export const adminUsersPatchSchema = z.object({
  id: z.string().cuid(),
  role: z.nativeEnum(UserRole),
});

export const adminSeoPatchSchema = z.object({
  pageKey: z.string().min(1).max(200).trim(),
  seoTitle: z.union([z.string().max(500), z.null()]).optional(),
  seoDescription: z.union([z.string().max(10000), z.null()]).optional(),
});

export const adminSettingsPatchSchema = z.object({
  key: z.string().min(1).max(100).trim(),
  valueJson: z.unknown(),
});

const navItemSchema = z.object({
  label: z.string().min(1).max(300).trim(),
  href: z.string().min(1).max(2048).trim(),
  description: z.union([z.string().max(500), z.null()]).optional(),
});

const adminNavigationMenuPatchSchema = z.object({
  key: z.string().min(1).max(100).trim(),
  items: z.array(navItemSchema).max(200),
});

const dropdownGroupItemsSchema = z.array(navItemSchema).max(200);

const headerDropdownsSchema = z.object({
  company: dropdownGroupItemsSchema,
  industries: dropdownGroupItemsSchema,
  solution: dropdownGroupItemsSchema,
  resources: dropdownGroupItemsSchema,
});

const adminNavigationDropdownsPatchSchema = z.object({
  dropdowns: headerDropdownsSchema,
});

export const adminNavigationPatchSchema = z.union([
  adminNavigationMenuPatchSchema,
  adminNavigationDropdownsPatchSchema,
]);

const footerLinkSchema = z.object({
  label: z.string().min(1).max(300).trim(),
  href: z.string().min(1).max(2048).trim(),
  description: z.union([z.string().max(500), z.null()]).optional(),
});

export const adminFooterPatchSchema = z.object({
  columns: z
    .record(z.string().max(200), z.array(footerLinkSchema).max(50))
    .refine((o) => Object.keys(o).length <= 40, 'Too many footer columns'),
});

export const adminFormsPatchSchema = z.object({
  id: z.string().cuid(),
  status: z.nativeEnum(SubmissionStatus),
});

export const adminContentPostSchema = z.object({
  key: z.string().min(1).max(200).trim(),
  title: z.string().min(1).max(500).trim(),
  slug: z.string().min(1).max(500).trim(),
});

export const adminContentPatchSchema = z
  .object({
    title: z.string().max(500).optional(),
    slug: z.string().max(500).optional(),
    seoTitle: z.union([z.string().max(500), z.null()]).optional(),
    seoDescription: z.union([z.string().max(10000), z.null()]).optional(),
    status: z.literal('draft').optional(),
  })
  .strict();

export const adminContentDuplicatePostSchema = z
  .object({
    title: z.union([z.string().min(1).max(500).trim(), z.null()]).optional(),
    key: z.union([z.string().min(1).max(200).trim(), z.null()]).optional(),
    slug: z.union([z.string().min(1).max(500).trim(), z.null()]).optional(),
  })
  .strict();

export const adminBlockDraftPatchSchema = z.object({
  draftJson: z.unknown(),
});

export const adminBlockBatchPatchSchema = z.object({
  updates: z
    .array(
      z.object({
        blockId: z.string().cuid(),
        draftJson: z.unknown(),
      })
    )
    .min(1)
    .max(80),
});

function emptyToUndefined(v: unknown): unknown {
  if (v === null || v === undefined) return undefined;
  if (typeof v === 'string') {
    const t = v.trim();
    return t === '' ? undefined : t;
  }
  return v;
}

function trimString(v: unknown): unknown {
  return typeof v === 'string' ? v.trim() : v;
}

export const adminSectionPostSchema = z
  .object({
    key: z.string().min(1).max(200).trim(),
    label: z.string().min(1).max(300).trim(),
    blockType: z.preprocess(trimString, z.string().min(1).max(64).refine((t) => isCmsBlockType(t), 'Invalid block type')),
    templateId: z.preprocess(emptyToUndefined, z.string().min(1).max(64).optional()),
  })
  .strict()
  .refine(
    (d) => {
      if (!d.templateId) return true;
      const t = getSectionTemplateById(d.templateId);
      return t !== undefined && t.blockType === d.blockType;
    },
    { message: 'Invalid or mismatched templateId for blockType' },
  );

export const adminSectionReorderSchema = z.object({
  sectionKeys: z.array(z.string().min(1).max(200)).min(1).max(100),
});

export const adminUsersPostSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(500),
  name: z.string().trim().max(200).optional(),
  role: z.nativeEnum(UserRole).optional(),
});
