import AuditLogClient, { type AuditRow } from '@/components/admin/pages/AuditLogClient';
import EmptyState from '@/components/admin/EmptyState';
import pageStyles from '@/components/admin/adminPage.module.css';
import { prisma } from '@/lib/db/prisma';

export default async function AdminAuditPage() {
  const take = 50;
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      take,
      orderBy: { createdAt: 'desc' },
      include: { actor: { select: { email: true, name: true } } },
    }),
    prisma.auditLog.count(),
  ]);

  const rows: AuditRow[] = logs.map((log) => ({
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    createdAt: log.createdAt.toISOString(),
    metadataJson: log.metadataJson as unknown,
    actor: log.actor,
  }));

  return (
    <>
      <h1 className={pageStyles.pageTitle}>Audit Timeline</h1>
      <p className={pageStyles.lead}>Immutable log of CMS actions with actor and metadata.</p>
      {rows.length === 0 ? (
        <EmptyState title="No audit entries" />
      ) : (
        <AuditLogClient initialLogs={rows} initialTotal={total} />
      )}
    </>
  );
}
