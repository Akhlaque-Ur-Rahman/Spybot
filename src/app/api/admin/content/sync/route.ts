import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/api/admin';
import { createAuditLog } from '@/lib/cms/audit';
import { syncCmsRegistry } from '@/lib/cms/registry-sync';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function POST(request: NextRequest) {
  const rateLimitError = applyRateLimit(request, 20);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;

  const result = await syncCmsRegistry();

  await createAuditLog({
    actorId: auth.session.user.id,
    action: 'content.sync_registry',
    entityType: 'page',
    entityId: 'cms-registry',
    afterJson: result,
  });

  return NextResponse.json({ ok: true, ...result });
}
