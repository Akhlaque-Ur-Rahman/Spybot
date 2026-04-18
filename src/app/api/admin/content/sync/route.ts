import { Prisma, UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/api/admin';
import { createAuditLog } from '@/lib/cms/audit';
import { syncCmsRegistry } from '@/lib/cms/registry-sync';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

function publicMessageForSyncFailure(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2022') {
      return 'Your content data is out of date. Refresh this page and try again.';
    }
  }
  return 'We could not sync the website pages. Please try again in a moment.';
}

export async function POST(request: NextRequest) {
  const rateLimitError = applyRateLimit(request, 20);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;

  try {
    const result = await syncCmsRegistry();

    await createAuditLog({
      actorId: auth.session.user.id,
      action: 'content.sync_registry',
      entityType: 'page',
      entityId: 'cms-registry',
      afterJson: result,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error('[api/admin/content/sync] sync failed', error);
    return NextResponse.json({ error: publicMessageForSyncFailure(error) }, { status: 500 });
  }
}
