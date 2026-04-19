import { UserRole } from '@prisma/client';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { adminContentPatchSchema } from '@/lib/api/admin-body-schemas';
import { readValidatedJson } from '@/lib/api/json-request';
import { requireApiRole } from '@/lib/api/admin';
import { createAuditLog } from '@/lib/cms/audit';
import { prisma } from '@/lib/db/prisma';
import { getCmsRegistryPageByKey } from '@/lib/cms/page-registry';
import { normalizeCmsPageSlug } from '@/lib/cms/service';
import { validatePublicCmsSlugInput } from '@/lib/cms/slug-validation';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function GET(
  request: NextRequest,
  context: RouteContext<'/api/admin/content/[pageKey]'>
) {
  const rateLimitError = applyRateLimit(request, 240);
  if (rateLimitError) return rateLimitError;
  const auth = await requireApiRole();
  if (auth.error) return auth.error;

  const { pageKey } = await context.params;
  const page = await prisma.page.findUnique({
    where: { key: pageKey },
    include: { sections: { include: { blocks: true }, orderBy: { position: 'asc' } } },
  });

  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ page });
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext<'/api/admin/content/[pageKey]'>
) {
  const rateLimitError = applyRateLimit(request, 40);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;

  const { pageKey } = await context.params;

  const parsed = await readValidatedJson(request, adminContentPatchSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const before = await prisma.page.findUnique({ where: { key: pageKey } });

  const data: {
    title?: string;
    slug?: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
    status?: string;
  } = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.slug !== undefined && body.slug.trim()) {
    const slug = normalizeCmsPageSlug(
      body.slug.trim().startsWith('/') ? body.slug.trim() : `/${body.slug.trim()}`
    );
    const registryPage = getCmsRegistryPageByKey(pageKey);
    const err = validatePublicCmsSlugInput(slug, registryPage?.slug);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
    const other = await prisma.page.findFirst({ where: { slug, NOT: { key: pageKey } } });
    if (other) return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });
    data.slug = slug;
  }
  if (body.seoTitle !== undefined) data.seoTitle = body.seoTitle;
  if (body.seoDescription !== undefined) data.seoDescription = body.seoDescription;
  if (body.status !== undefined) {
    data.status = body.status;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No updatable fields' }, { status: 400 });
  }

  const page = await prisma.page.update({
    where: { key: pageKey },
    data,
  });

  if (page.status === 'published') {
    try {
      revalidateTag('cms-sitemap-pages', 'max');
    } catch {
      /* best-effort */
    }
  }

  await createAuditLog({
    actorId: auth.session.user.id,
    action: 'content.update_page',
    entityType: 'page',
    entityId: page.id,
    beforeJson: before,
    afterJson: page,
  });

  return NextResponse.json({ page });
}
