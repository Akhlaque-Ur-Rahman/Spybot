import Link from 'next/link';
import NavigationEditorClient, { type MenuRow } from '@/components/admin/pages/NavigationEditorClient';
import EmptyState from '@/components/admin/EmptyState';
import pageStyles from '@/components/admin/adminPage.module.css';
import { prisma } from '@/lib/db/prisma';

export default async function AdminNavigationPage() {
  const menus = await prisma.navigationMenu.findMany({
    include: { items: { orderBy: { position: 'asc' } } },
  });

  const rows: MenuRow[] = menus.map((m) => ({
    id: m.id,
    key: m.key,
    items: m.items.map((i) => ({
      id: i.id,
      label: i.label,
      href: i.href,
      description: i.description,
    })),
  }));

  return (
    <>
      <h1 className={pageStyles.pageTitle}>Navigation</h1>
      <p className={pageStyles.lead}>
        Manage the public header navigation. `header-main` is the primary navbar and `header-utility`
        is the small top bar above it. See the{' '}
        <Link href="/admin/guide" className={pageStyles.link}>
          CMS guide
        </Link>{' '}
        for the full editing workflow.
      </p>
      {rows.length === 0 ? (
        <EmptyState title="No menus" description="Run the database seed to create the default header menu." />
      ) : (
        <NavigationEditorClient key={rows.map((m) => `${m.id}-${m.items.length}`).join('|')} menus={rows} />
      )}
    </>
  );
}
