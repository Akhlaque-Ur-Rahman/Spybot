import { UserRole } from '@prisma/client';
import { revalidatePath, revalidateTag } from 'next/cache';
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
  const rateLimitError = await applyRateLimit(request, 240);
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
  const rateLimitError = await applyRateLimit(request, 40);
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
  if (!before) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

  if (body.expectedUpdatedAt && before.updatedAt.toISOString() !== body.expectedUpdatedAt) {
    return NextResponse.json(
      {
        error: 'Your content data is out of date. Refresh this page and try again.',
        latestUpdatedAt: before.updatedAt.toISOString(),
      },
      { status: 409 }
    );
  }

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

  const updateResult = await prisma.page.updateMany({
    where: {
      key: pageKey,
      ...(body.expectedUpdatedAt ? { updatedAt: before.updatedAt } : {}),
    },
    data,
  });
  if (updateResult.count === 0) {
    const latest = await prisma.page.findUnique({ where: { key: pageKey } });
    return NextResponse.json(
      {
        error: 'Your content data is out of date. Refresh this page and try again.',
        latestUpdatedAt: latest?.updatedAt.toISOString(),
      },
      { status: 409 }
    );
  }
  const page = await prisma.page.findUnique({ where: { key: pageKey } });
  if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

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

export async function DELETE(
  request: NextRequest,
  context: RouteContext<'/api/admin/content/[pageKey]'>
) {
  const rateLimitError = await applyRateLimit(request, 20);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;

  const { pageKey } = await context.params;

  if (getCmsRegistryPageByKey(pageKey)) {
    return NextResponse.json({ error: 'This page is part of the site template and cannot be removed.' }, { status: 403 });
  }

  const before = await prisma.page.findUnique({ where: { key: pageKey } });
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.page.delete({ where: { key: pageKey } });

  try {
    revalidatePath('/', 'layout');
    const path = before.slug.startsWith('/') ? before.slug : `/${before.slug}`;
    revalidatePath(path);
    revalidateTag('cms-sitemap-pages', 'max');
  } catch {
    /* best-effort */
  }

  await createAuditLog({
    actorId: auth.session.user.id,
    action: 'content.delete_page',
    entityType: 'page',
    entityId: before.id,
    beforeJson: before,
  });

  return NextResponse.json({ ok: true });
}
