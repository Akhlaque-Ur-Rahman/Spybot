import { Prisma, UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { createAuditLog } from '@/lib/cms/audit';
import { prisma } from '@/lib/db/prisma';
import { requireApiRole } from '@/lib/api/admin';
import { getCmsRegistryPageByKey } from '@/lib/cms/page-registry';
import { normalizeCmsPageSlug } from '@/lib/cms/service';
import { validatePublicCmsSlugInput } from '@/lib/cms/slug-validation';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function GET() {
  const auth = await requireApiRole();
  if (auth.error) return auth.error;

  const pages = await prisma.page.findMany({
    include: { sections: { include: { blocks: true }, orderBy: { position: 'asc' } } },
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json({ pages });
}

export async function POST(request: NextRequest) {
  const rateLimitError = applyRateLimit(request, 30);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;

  const body = (await request.json()) as { key?: string; title?: string; slug?: string };
  if (typeof body.key !== 'string' || !body.key.trim()) {
    return NextResponse.json({ error: 'key is required' }, { status: 400 });
  }
  if (typeof body.title !== 'string' || !body.title.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }
  if (typeof body.slug !== 'string' || !body.slug.trim()) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  }

  const slug = normalizeCmsPageSlug(body.slug.trim().startsWith('/') ? body.slug.trim() : `/${body.slug.trim()}`);
  const registryDef = getCmsRegistryPageByKey(body.key.trim());
  const slugErr = validatePublicCmsSlugInput(slug, registryDef?.slug);
  if (slugErr) return NextResponse.json({ error: slugErr }, { status: 400 });

  if (registryDef && normalizeCmsPageSlug(slug) !== normalizeCmsPageSlug(registryDef.slug)) {
    return NextResponse.json(
      { error: 'This page key uses a fixed URL; slug must match that path.' },
      { status: 400 }
    );
  }

  const existingSlug = await prisma.page.findUnique({ where: { slug } });
  if (existingSlug) return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });

  let page;
  try {
    page = await prisma.page.create({
      data: {
        key: body.key.trim(),
        title: body.title.trim(),
        slug,
        status: 'draft',
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      const fields = e.meta?.target;
      const target = Array.isArray(fields) ? fields.join(',') : String(fields ?? '');
      if (target.includes('key')) {
        return NextResponse.json({ error: 'Page key already in use' }, { status: 409 });
      }
      if (target.includes('slug')) {
        return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });
      }
      return NextResponse.json({ error: 'A unique constraint was violated' }, { status: 409 });
    }
    throw e;
  }

  await createAuditLog({
    actorId: auth.session.user.id,
    action: 'content.create_page',
    entityType: 'page',
    entityId: page.id,
    afterJson: page,
  });

  return NextResponse.json({ page }, { status: 201 });
}
