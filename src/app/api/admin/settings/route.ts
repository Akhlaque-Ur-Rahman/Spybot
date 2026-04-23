import { Prisma, UserRole } from '@prisma/client';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { adminSettingsPatchSchema } from '@/lib/api/admin-body-schemas';
import { readValidatedJson } from '@/lib/api/json-request';
import { requireApiRole } from '@/lib/api/admin';
import { prisma } from '@/lib/db/prisma';
import { validateSiteRuntimeSettingsJson } from '@/lib/cms/site-runtime-config';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function GET() {
  const auth = await requireApiRole();
  if (auth.error) return auth.error;
  const settings = await prisma.siteSetting.findMany({ orderBy: { key: 'asc' } });
  return NextResponse.json({ settings });
}

export async function PATCH(request: NextRequest) {
  const rateLimitError = await applyRateLimit(request, 30);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;

  const parsed = await readValidatedJson(request, adminSettingsPatchSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  if (body.key === 'site') {
    const siteCheck = validateSiteRuntimeSettingsJson(body.valueJson);
    if (!siteCheck.ok) {
      return NextResponse.json({ error: siteCheck.error }, { status: 400 });
    }
  }
  const valueJson = body.valueJson as Prisma.InputJsonValue;

  const setting = await prisma.siteSetting.upsert({
    where: { key: body.key },
    update: { valueJson },
    create: { key: body.key, valueJson },
  });
  if (body.key === 'global') revalidateTag('cms-global-settings', 'max');
  if (body.key === 'site') revalidateTag('cms-site-runtime-config', 'max');
  if (body.key === 'footer-columns') revalidateTag('cms-footer-menu', 'max');
  return NextResponse.json({ setting });
}
