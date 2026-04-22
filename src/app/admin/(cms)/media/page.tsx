import MediaLibraryClient, { type AssetRow } from '@/components/admin/pages/MediaLibraryClient';
import pageStyles from '@/components/admin/adminPage.module.css';
import {
  buildMediaListOrderBy,
  buildMediaListWhere,
  parseMediaListQuery,
} from '@/lib/admin/media-list-query';
import { buildMediaUsageMap } from '@/lib/admin/media-usage';
import { prisma } from '@/lib/db/prisma';

type SearchParamsInput = Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;

export default async function AdminMediaPage({ searchParams }: { searchParams: SearchParamsInput }) {
  const sp = await Promise.resolve(searchParams);
  const parsed = parseMediaListQuery(sp);
  const where = buildMediaListWhere(parsed);
  const orderBy = buildMediaListOrderBy(parsed.sort);

  const [globalCount, total] = await Promise.all([
    prisma.mediaAsset.count(),
    prisma.mediaAsset.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / parsed.perPage));
  const page = Math.min(parsed.page, totalPages);
  const skip = (page - 1) * parsed.perPage;

  const assets = await prisma.mediaAsset.findMany({
    where,
    orderBy,
    skip,
    take: parsed.perPage,
  });
  const usageByUrl = await buildMediaUsageMap(assets.map((a) => a.url));

  const listQuery = { ...parsed, page };
  const rows: AssetRow[] = assets.map((a) => ({
    id: a.id,
    url: a.url,
    alt: a.alt,
    tags: a.tags,
    mimeType: a.mimeType,
    referenceKey: a.referenceKey,
    createdAt: a.createdAt.toISOString(),
    usageCount: usageByUrl.get(a.url)?.count ?? 0,
    usagePreview: usageByUrl.get(a.url)?.items ?? [],
  }));

  return (
    <>
      <h1 className={pageStyles.pageTitle}>Media Library</h1>
      <p className={pageStyles.lead}>URL-based registration.</p>
      <MediaLibraryClient
        assets={rows}
        listQuery={listQuery}
        total={total}
        totalPages={totalPages}
        emptyLibrary={globalCount === 0}
      />
    </>
  );
}
