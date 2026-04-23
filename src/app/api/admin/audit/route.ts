import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/api/admin';
import { prisma } from '@/lib/db/prisma';
import { applyRateLimit } from '@/lib/security/request-guards';

export async function GET(request: NextRequest) {
  const rateLimitError = await applyRateLimit(request, 240);
  if (rateLimitError) return rateLimitError;
  const auth = await requireApiRole();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(200, Math.max(1, Number.parseInt(searchParams.get('limit') ?? '50', 10) || 50));
  const offset = Math.max(0, Number.parseInt(searchParams.get('offset') ?? '0', 10) || 0);

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      include: { actor: { select: { email: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.auditLog.count(),
  ]);

  return NextResponse.json({ logs, total, limit, offset });
}
