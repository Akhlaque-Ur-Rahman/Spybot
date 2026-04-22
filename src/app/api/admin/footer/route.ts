import { UserRole } from '@prisma/client';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { adminFooterPatchSchema } from '@/lib/api/admin-body-schemas';
import { readValidatedJson } from '@/lib/api/json-request';
import { requireApiRole } from '@/lib/api/admin';
import { createAuditLog } from '@/lib/cms/audit';
import { prisma } from '@/lib/db/prisma';
import type { NavMenuItem } from '@/lib/cms/types';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';
import { normalizeFooterSettings } from '@/lib/cms/footer-settings';

const FOOTER_CONFIG_KEY = 'footer-config';
const FOOTER_COLUMNS_KEY = 'footer-columns';

export async function GET() {
  const auth = await requireApiRole();
  if (auth.error) return auth.error;

  const [configRow, columnsRow] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { key: FOOTER_CONFIG_KEY } }),
    prisma.siteSetting.findUnique({ where: { key: FOOTER_COLUMNS_KEY } }),
  ]);
  const legacyColumns = (columnsRow?.valueJson as Record<string, NavMenuItem[]> | undefined) ?? null;
  const settings = normalizeFooterSettings(configRow?.valueJson, legacyColumns);
  return NextResponse.json(settings);
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

  const [beforeConfig, legacyColumnsRow] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { key: FOOTER_CONFIG_KEY } }),
    prisma.siteSetting.findUnique({ where: { key: FOOTER_COLUMNS_KEY } }),
  ]);
  const legacyColumns = (legacyColumnsRow?.valueJson as Record<string, NavMenuItem[]> | undefined) ?? null;
  const current = normalizeFooterSettings(beforeConfig?.valueJson, legacyColumns);
  const merged = {
    ...current,
    ...body,
    companyDetails: body.companyDetails ? { ...current.companyDetails, ...body.companyDetails } : current.companyDetails,
    credit: body.credit ? { ...current.credit, ...body.credit } : current.credit,
  };

  const row = await prisma.siteSetting.upsert({
    where: { key: FOOTER_CONFIG_KEY },
    update: { valueJson: merged as object },
    create: { key: FOOTER_CONFIG_KEY, valueJson: merged as object },
  });

  await createAuditLog({
    actorId: auth.session.user.id,
    action: 'footer.update',
    entityType: 'siteSetting',
    entityId: FOOTER_CONFIG_KEY,
    beforeJson: beforeConfig ?? undefined,
    afterJson: row,
  });

  revalidateTag('cms-footer-menu', 'max');
  revalidateTag('cms-footer-config', 'max');

  return NextResponse.json({ ok: true, footer: row.valueJson });
}
