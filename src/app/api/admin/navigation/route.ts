import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/api/admin';
import { prisma } from '@/lib/db/prisma';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function GET() {
  const auth = await requireApiRole();
  if (auth.error) return auth.error;
  const menus = await prisma.navigationMenu.findMany({
    include: { items: { orderBy: { position: 'asc' } } },
  });
  return NextResponse.json({ menus });
}

export async function PATCH(request: NextRequest) {
  const rateLimitError = applyRateLimit(request, 30);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;
  const body = await request.json();
  const menu = await prisma.navigationMenu.upsert({
    where: { key: body.key },
    update: {
      items: {
        deleteMany: {},
        create: (body.items ?? []).map(
          (item: { label: string; href: string; description?: string }, index: number) => ({
            label: item.label,
            href: item.href,
            description: item.description,
            position: index + 1,
          })
        ),
      },
    },
    create: {
      key: body.key,
      items: {
        create: (body.items ?? []).map(
          (item: { label: string; href: string; description?: string }, index: number) => ({
            label: item.label,
            href: item.href,
            description: item.description,
            position: index + 1,
          })
        ),
      },
    },
    include: { items: true },
  });
  return NextResponse.json({ menu });
}
