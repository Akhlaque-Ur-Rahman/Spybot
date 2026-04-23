import { UserRole } from '@prisma/client';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { adminNavigationPatchSchema } from '@/lib/api/admin-body-schemas';
import { readValidatedJson } from '@/lib/api/json-request';
import { requireApiRole } from '@/lib/api/admin';
import { createAuditLog } from '@/lib/cms/audit';
import { prisma } from '@/lib/db/prisma';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

const HEADER_DROPDOWNS_KEY = 'header-dropdowns';

export async function GET() {
  const auth = await requireApiRole();
  if (auth.error) return auth.error;
  const menus = await prisma.navigationMenu.findMany({
    include: { items: { orderBy: { position: 'asc' } } },
  });
  return NextResponse.json({ menus });
}

export async function PATCH(request: NextRequest) {
  const rateLimitError = await applyRateLimit(request, 30);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;

  const parsed = await readValidatedJson(request, adminNavigationPatchSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  if ('dropdowns' in body) {
    const before = await prisma.siteSetting.findUnique({ where: { key: HEADER_DROPDOWNS_KEY } });
    const setting = await prisma.siteSetting.upsert({
      where: { key: HEADER_DROPDOWNS_KEY },
      update: { valueJson: body.dropdowns as object },
      create: { key: HEADER_DROPDOWNS_KEY, valueJson: body.dropdowns as object },
    });
    await createAuditLog({
      actorId: auth.session.user.id,
      action: 'navigation.update_dropdowns',
      entityType: 'siteSetting',
      entityId: HEADER_DROPDOWNS_KEY,
      beforeJson: before ?? undefined,
      afterJson: setting,
    });
    revalidateTag('cms-header-dropdowns', 'max');
    return NextResponse.json({ ok: true, dropdowns: setting.valueJson });
  }

  const beforeMenu = await prisma.navigationMenu.findUnique({
    where: { key: body.key },
    include: { items: { orderBy: { position: 'asc' } } },
  });

  const menu = await prisma.navigationMenu.upsert({
    where: { key: body.key },
    update: {
      items: {
        deleteMany: {},
        create: body.items.map((item, index: number) => ({
          label: item.label,
          href: item.href,
          description: item.description,
          position: index + 1,
        })),
      },
    },
    create: {
      key: body.key,
      items: {
        create: body.items.map((item, index: number) => ({
          label: item.label,
          href: item.href,
          description: item.description,
          position: index + 1,
        })),
      },
    },
    include: { items: true },
  });

  await createAuditLog({
    actorId: auth.session.user.id,
    action: 'navigation.update_menu',
    entityType: 'navigationMenu',
    entityId: body.key,
    beforeJson: beforeMenu ?? undefined,
    afterJson: menu,
  });

  if (body.key === 'header-main') revalidateTag('cms-header-menu', 'max');
  if (body.key === 'header-utility') revalidateTag('cms-header-utility-menu', 'max');
  return NextResponse.json({ menu });
}
