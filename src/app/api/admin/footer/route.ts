import { UserRole } from '@prisma/client';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { adminFooterPatchSchema } from '@/lib/api/admin-body-schemas';
import { readValidatedJson } from '@/lib/api/json-request';
import { requireApiRole } from '@/lib/api/admin';
import { createAuditLog } from '@/lib/cms/audit';
import { getFooterColumnsSetting } from '@/lib/cms/page-registry';
import { prisma } from '@/lib/db/prisma';
import type { NavMenuItem } from '@/lib/cms/types';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

const FOOTER_KEY = 'footer-columns';

export async function GET() {
  const auth = await requireApiRole();
  if (auth.error) return auth.error;

  const row = await prisma.siteSetting.findUnique({ where: { key: FOOTER_KEY } });
  const columns = (row?.valueJson as Record<string, NavMenuItem[]> | undefined) ?? getFooterColumnsSetting();
  return NextResponse.json({ columns });
}

export async function PATCH(request: NextRequest) {
  const rateLimitError = applyRateLimit(request, 20);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;

  const parsed = await readValidatedJson(request, adminFooterPatchSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const before = await prisma.siteSetting.findUnique({ where: { key: FOOTER_KEY } });

  const row = await prisma.siteSetting.upsert({
    where: { key: FOOTER_KEY },
    update: { valueJson: body.columns as object },
    create: { key: FOOTER_KEY, valueJson: body.columns as object },
  });

  await createAuditLog({
    actorId: auth.session.user.id,
    action: 'footer.update_columns',
    entityType: 'siteSetting',
    entityId: FOOTER_KEY,
    beforeJson: before ?? undefined,
    afterJson: row,
  });

  revalidateTag('cms-footer-menu', 'max');

  return NextResponse.json({ ok: true, columns: row.valueJson });
}
