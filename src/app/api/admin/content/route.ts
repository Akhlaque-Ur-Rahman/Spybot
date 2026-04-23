import { Prisma, UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { adminContentPostSchema } from '@/lib/api/admin-body-schemas';
import { readValidatedJson } from '@/lib/api/json-request';
import { createAuditLog } from '@/lib/cms/audit';
import { prisma } from '@/lib/db/prisma';
import { requireApiRole } from '@/lib/api/admin';
import { getCmsRegistryPageByKey } from '@/lib/cms/page-registry';
import { normalizeCmsPageSlug } from '@/lib/cms/service';
import { validatePublicCmsSlugInput } from '@/lib/cms/slug-validation';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function GET(request: NextRequest) {
  const rateLimitError = await applyRateLimit(request, 240);
  if (rateLimitError) return rateLimitError;
  const auth = await requireApiRole();
  if (auth.error) return auth.error;
  const pageParam = Number(request.nextUrl.searchParams.get('page') ?? '1');
  const perParam = Number(request.nextUrl.searchParams.get('perPage') ?? '25');
  const page = Number.isFinite(pageParam) ? Math.max(1, Math.floor(pageParam)) : 1;
  const perPage = Number.isFinite(perParam) ? Math.min(100, Math.max(1, Math.floor(perParam))) : 25;
  const includeTree = request.nextUrl.searchParams.get('includeTree') !== '0';
  const skip = (page - 1) * perPage;

  const [total, pages] = await Promise.all([
    prisma.page.count(),
    prisma.page.findMany({
      ...(includeTree ? { include: { sections: { include: { blocks: true }, orderBy: { position: 'asc' } } } } : {}),
      orderBy: { updatedAt: 'desc' },
      skip,
      take: perPage,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  return NextResponse.json({ pages, total, page, perPage, totalPages, includeTree });
}

export async function POST(request: NextRequest) {
  const rateLimitError = await applyRateLimit(request, 30);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;

  const parsed = await readValidatedJson(request, adminContentPostSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const slug = normalizeCmsPageSlug(body.slug.startsWith('/') ? body.slug : `/${body.slug}`);
  const registryDef = getCmsRegistryPageByKey(body.key);
  const slugErr = validatePublicCmsSlugInput(slug, registryDef?.slug);
  if (slugErr) return NextResponse.json({ error: slugErr }, { status: 400 });

  const existingSlug = await prisma.page.findUnique({ where: { slug } });
  if (existingSlug) return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });

  let page;
  try {
    page = await prisma.page.create({
      data: {
        key: body.key,
        title: body.title,
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
