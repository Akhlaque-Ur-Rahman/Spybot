import { Prisma, UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { suggestCmsPageKeyFromTitle } from '@/lib/admin/suggest-page-key';
import { adminContentDuplicatePostSchema } from '@/lib/api/admin-body-schemas';
import { readValidatedJson } from '@/lib/api/json-request';
import { requireApiRole } from '@/lib/api/admin';
import { createAuditLog } from '@/lib/cms/audit';
import { prisma } from '@/lib/db/prisma';
import { getCmsRegistryPageByKey } from '@/lib/cms/page-registry';
import { normalizeCmsPageSlug } from '@/lib/cms/service';
import { validatePublicCmsSlugInput } from '@/lib/cms/slug-validation';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

type Tx = Prisma.TransactionClient;

function blockJsonForDuplicate(value: unknown): Prisma.InputJsonValue {
  if (value === null || value === undefined) return {};
  return value as Prisma.InputJsonValue;
}

async function allocateUniquePageKeyAuto(tx: Tx, baseRaw: string): Promise<string> {
  const sanitized = baseRaw
    .trim()
    .slice(0, 200)
    .replace(/^-+|-+$/g, '');
  const base = sanitized || 'page';

  for (let n = 0; n < 10_000; n++) {
    const suffix = n === 0 ? '' : `-${n + 1}`;
    const room = 200 - suffix.length;
    const stem = base.length > room ? base.slice(0, room) : base;
    const key = `${stem}${suffix}`;
    const exists = await tx.page.findUnique({ where: { key } });
    const reservedTemplateKey = Boolean(getCmsRegistryPageByKey(key));
    if (!exists && !reservedTemplateKey) return key;
  }
  throw new Error('key_alloc');
}

async function allocateUniqueSlug(tx: Tx, initialNormalizedSlug: string): Promise<string | null> {
  const base = normalizeCmsPageSlug(initialNormalizedSlug);

  for (let n = 0; n < 10_000; n++) {
    const candidate =
      n === 0
        ? base
        : base === '/'
          ? normalizeCmsPageSlug(`/${n}`)
          : normalizeCmsPageSlug(`${base}-${n}`);
    const err = validatePublicCmsSlugInput(candidate, undefined);
    if (err) continue;
    const taken = await tx.page.findUnique({ where: { slug: candidate } });
    if (!taken) return candidate;
  }
  return null;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ pageKey: string }> }
) {
  const rateLimitError = await applyRateLimit(request, 20);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;

  const { pageKey } = await context.params;

  const parsed = await readValidatedJson(request, adminContentDuplicatePostSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const source = await prisma.page.findUnique({
    where: { key: pageKey },
    include: { sections: { include: { blocks: true }, orderBy: { position: 'asc' } } },
  });
  if (!source) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const sourceTitle = source.title.trim() || 'Page';
  const resolvedTitle = (body.title?.trim() || `${sourceTitle} (Copy)`).slice(0, 500);

  try {
    const page = await prisma.$transaction(async (tx) => {
      let newKey: string;
      if (body.key?.trim()) {
        const k = body.key.trim().slice(0, 200);
        const exists = await tx.page.findUnique({ where: { key: k } });
        if (exists) {
          throw Object.assign(new Error('key_in_use'), { code: 'key_in_use' as const });
        }
        if (getCmsRegistryPageByKey(k)) {
          throw Object.assign(new Error('registry_key'), { code: 'registry_key' as const });
        }
        newKey = k;
      } else {
        const keyBase = suggestCmsPageKeyFromTitle(resolvedTitle);
        newKey = await allocateUniquePageKeyAuto(tx, keyBase);
      }

      let newSlug: string;
      if (body.slug?.trim()) {
        const raw = body.slug.trim();
        newSlug = normalizeCmsPageSlug(raw.startsWith('/') ? raw : `/${raw}`);
        const registryDef = getCmsRegistryPageByKey(newKey);
        const slugErr = validatePublicCmsSlugInput(newSlug, registryDef?.slug);
        if (slugErr) {
          throw Object.assign(new Error(slugErr), { code: 'slug_invalid' as const });
        }
        const slugTaken = await tx.page.findUnique({ where: { slug: newSlug } });
        if (slugTaken) {
          throw Object.assign(new Error('slug_in_use'), { code: 'slug_in_use' as const });
        }
      } else {
        const initial = normalizeCmsPageSlug(`/${newKey}`);
        const allocated = await allocateUniqueSlug(tx, initial);
        if (!allocated) {
          throw Object.assign(new Error('slug_alloc'), { code: 'slug_alloc' as const });
        }
        newSlug = allocated;
      }

      return tx.page.create({
        data: {
          key: newKey,
          title: resolvedTitle,
          slug: newSlug,
          status: 'draft',
          seoTitle: source.seoTitle,
          seoDescription: source.seoDescription,
          parentId: null,
          sections: {
            create: source.sections.map((s) => ({
              key: s.key,
              label: s.label,
              position: s.position,
              isEnabled: s.isEnabled,
              blocks: {
                create: s.blocks.map((b) => ({
                  key: b.key,
                  type: b.type,
                  position: b.position,
                  draftJson: blockJsonForDuplicate(b.draftJson),
                  liveJson: blockJsonForDuplicate(b.liveJson),
                })),
              },
            })),
          },
        },
        include: { sections: { include: { blocks: true }, orderBy: { position: 'asc' } } },
      });
    });

    await createAuditLog({
      actorId: auth.session.user.id,
      action: 'content.duplicate_page',
      entityType: 'page',
      entityId: page.id,
      beforeJson: { sourceKey: source.key, sourceId: source.id },
      afterJson: { key: page.key, title: page.title, slug: page.slug },
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return NextResponse.json({ error: 'A unique constraint was violated' }, { status: 409 });
    }
    if (e && typeof e === 'object' && 'code' in e) {
      const code = (e as { code?: string }).code;
      if (code === 'key_in_use') {
        return NextResponse.json({ error: 'Page key already in use' }, { status: 409 });
      }
      if (code === 'slug_in_use') {
        return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });
      }
      if (code === 'slug_invalid' && e instanceof Error) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
      if (code === 'slug_alloc') {
        return NextResponse.json({ error: 'Could not allocate a unique address' }, { status: 409 });
      }
      if (code === 'registry_key') {
        return NextResponse.json(
          { error: 'This page key is reserved for the site template.' },
          { status: 400 },
        );
      }
    }
    if (e instanceof Error && e.message === 'key_alloc') {
      return NextResponse.json({ error: 'Could not allocate a unique page key' }, { status: 409 });
    }
    throw e;
  }
}
