import Link from 'next/link';
import ContentPageEditor, {
  type SerializedPage,
} from '@/components/admin/pages/ContentPageEditor';
import pageStyles from '@/components/admin/adminPage.module.css';
import { prisma } from '@/lib/db/prisma';

export default async function AdminContentDetailPage({
  params,
}: {
  params: Promise<{ pageKey: string }>;
}) {
  const { pageKey } = await params;

  const page = await prisma.page.findUnique({
    where: { key: pageKey },
    include: { sections: { include: { blocks: true }, orderBy: { position: 'asc' } } },
  });

  if (!page) {
    return (
      <>
        <nav className={pageStyles.lead} style={{ marginBottom: 'var(--space-2)' }}>
          <Link href="/admin/content" className={pageStyles.link}>
            ← All pages
          </Link>
        </nav>
        <h1 className={pageStyles.pageTitle}>Content</h1>
        <p className={pageStyles.lead}>Page not found.</p>
      </>
    );
  }

  const serialized = JSON.parse(JSON.stringify(page)) as SerializedPage;

  return (
    <>
      <nav className={pageStyles.lead} style={{ marginBottom: 'var(--space-2)' }}>
        <Link href="/admin/content" className={pageStyles.link}>
          ← All pages
        </Link>
        <span style={{ color: 'var(--color-text-secondary)' }}> / </span>
        <span>{page.title}</span>
      </nav>
      <h1 className={pageStyles.pageTitle}>Edit: {page.title}</h1>
      <p className={pageStyles.lead}>
        <span className={pageStyles.muted}>Public address </span>
        <code className={pageStyles.mono}>
          {page.slug === '/' ? '/' : `/${String(page.slug).replace(/^\//, '')}`}
        </code>
      </p>
      <ContentPageEditor key={page.updatedAt.toISOString()} page={serialized} />
    </>
  );
}
