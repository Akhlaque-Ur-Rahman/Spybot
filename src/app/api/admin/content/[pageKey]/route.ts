import { UserRole } from '@prisma/client';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/api/admin';
import { createAuditLog } from '@/lib/cms/audit';
import { prisma } from '@/lib/db/prisma';
import { getCmsRegistryPageByKey } from '@/lib/cms/page-registry';
import { normalizeCmsPageSlug } from '@/lib/cms/service';
import { validatePublicCmsSlugInput } from '@/lib/cms/slug-validation';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function GET(
  _request: NextRequest,
  context: RouteContext<'/api/admin/content/[pageKey]'>
) {
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
  const body = (await request.json()) as Record<string, unknown>;
  const before = await prisma.page.findUnique({ where: { key: pageKey } });

  const data: {
    title?: string;
    slug?: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
    status?: string;
  } = {};
  if (typeof body.title === 'string') data.title = body.title;
  if (typeof body.slug === 'string' && body.slug.trim()) {
    const slug = normalizeCmsPageSlug(
      body.slug.trim().startsWith('/') ? body.slug.trim() : `/${body.slug.trim()}`
    );
    const registryPage = getCmsRegistryPageByKey(pageKey);
    const err = validatePublicCmsSlugInput(slug, registryPage?.slug);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
    if (registryPage && normalizeCmsPageSlug(slug) !== normalizeCmsPageSlug(registryPage.slug)) {
      return NextResponse.json(
        { error: 'Built-in pages cannot change their public path.' },
        { status: 400 }
      );
    }
    const other = await prisma.page.findFirst({ where: { slug, NOT: { key: pageKey } } });
    if (other) return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });
    data.slug = slug;
  }
  if ('seoTitle' in body) data.seoTitle = (body.seoTitle as string | null) ?? null;
  if ('seoDescription' in body) data.seoDescription = (body.seoDescription as string | null) ?? null;
  if (typeof body.status === 'string') {
    if (body.status === 'published') {
      return NextResponse.json(
        { error: 'Use POST /api/admin/publish to publish; status cannot be set to published here.' },
        { status: 400 },
      );
    }
    if (body.status !== 'draft') {
      return NextResponse.json({ error: 'Invalid status; only "draft" is allowed.' }, { status: 400 });
    }
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
