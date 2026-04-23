import PublishQueueClient from '@/components/admin/pages/PublishQueueClient';
import pageStyles from '@/components/admin/adminPage.module.css';
import { prisma } from '@/lib/db/prisma';

export default async function AdminPublishPage() {
  const [drafts, published, versions] = await Promise.all([
    prisma.page.findMany({ where: { status: 'draft' }, orderBy: { updatedAt: 'desc' } }),
    prisma.page.findMany({ where: { status: 'published' }, orderBy: { updatedAt: 'desc' } }),
    prisma.pageVersion.findMany({
      take: 40,
      orderBy: { publishedAt: 'desc' },
      include: { page: { select: { title: true, key: true } } },
    }),
  ]);

  const versionRows = versions.map((v) => ({
    id: v.id,
    pageId: v.pageId,
    version: v.version,
    note: v.note,
    publishedAt: v.publishedAt.toISOString(),
    page: v.page,
  }));
  const lastPublishedAtByPage: Record<string, string> = {};
  for (const row of versionRows) {
    if (!lastPublishedAtByPage[row.page.key]) {
      lastPublishedAtByPage[row.page.key] = row.publishedAt;
    }
  }
  const draftRows = drafts.map((d) => ({
    ...d,
    updatedAt: d.updatedAt.toISOString(),
    lastPublishedAt: lastPublishedAtByPage[d.key] ?? null,
  }));

  return (
    <>
      <h1 className={pageStyles.pageTitle}>Publish Queue</h1>
      <p className={pageStyles.lead}>Review drafts and publish updates.</p>
      <PublishQueueClient drafts={draftRows} published={published} versions={versionRows} />
    </>
  );
}
