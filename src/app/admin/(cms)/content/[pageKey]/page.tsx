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
        <h1 className={pageStyles.pageTitle}>Content</h1>
        <p className={pageStyles.lead}>Page not found.</p>
      </>
    );
  }

  const serialized = JSON.parse(JSON.stringify(page)) as SerializedPage;

  return (
    <>
      <h1 className={pageStyles.pageTitle}>Edit: {page.title}</h1>
      <p className={pageStyles.lead}>
        Key <code className={pageStyles.mono}>{page.key}</code> · slug{' '}
        <code className={pageStyles.mono}>/{page.slug}</code>
      </p>
      <ContentPageEditor key={page.updatedAt.toISOString()} page={serialized} />
    </>
  );
}
