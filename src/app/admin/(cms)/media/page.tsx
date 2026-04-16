import MediaLibraryClient, { type AssetRow } from '@/components/admin/pages/MediaLibraryClient';
import pageStyles from '@/components/admin/adminPage.module.css';
import { prisma } from '@/lib/db/prisma';

export default async function AdminMediaPage() {
  const assets = await prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' }, take: 80 });
  const rows: AssetRow[] = assets.map((a) => ({
    id: a.id,
    url: a.url,
    alt: a.alt,
    tags: a.tags,
    mimeType: a.mimeType,
  }));

  return (
    <>
      <h1 className={pageStyles.pageTitle}>Media Library</h1>
      <p className={pageStyles.lead}>Grid of assets plus URL-based registration (no multipart upload in this build).</p>
      <MediaLibraryClient assets={rows} />
    </>
  );
}
