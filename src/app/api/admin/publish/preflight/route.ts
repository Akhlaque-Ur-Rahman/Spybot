import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { adminPublishPostSchema } from '@/lib/api/admin-body-schemas';
import { readValidatedJson } from '@/lib/api/json-request';
import { requireApiRole } from '@/lib/api/admin';
import { prisma } from '@/lib/db/prisma';
import { runPublishPreflight } from '@/lib/cms/publish-preflight';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function POST(request: NextRequest) {
  const rateLimitError = await applyRateLimit(request, 30);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;

  const parsed = await readValidatedJson(request, adminPublishPostSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const page = await prisma.page.findUnique({
    where: { key: body.pageKey },
    include: { sections: { include: { blocks: true } } },
  });
  if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

  const report = runPublishPreflight(page);
  return NextResponse.json({ report });
}
