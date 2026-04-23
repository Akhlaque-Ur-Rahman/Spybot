import NavigationEditorClient, { type MenuRow } from '@/components/admin/pages/NavigationEditorClient';
import EmptyState from '@/components/admin/EmptyState';
import pageStyles from '@/components/admin/adminPage.module.css';
import { getHeaderDropdownConfig } from '@/lib/cms/service';
import { prisma } from '@/lib/db/prisma';

export default async function AdminNavigationPage() {
  const [menus, dropdowns] = await Promise.all([
    prisma.navigationMenu.findMany({
      include: { items: { orderBy: { position: 'asc' } } },
    }),
    getHeaderDropdownConfig(),
  ]);

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
      <p className={pageStyles.lead}>Update menu links.</p>
      {rows.length === 0 ? (
        <EmptyState title="No menus" description="No menu found yet." />
      ) : (
        <NavigationEditorClient
          key={`${rows.map((m) => `${m.id}-${m.items.length}`).join('|')}:${Object.values(dropdowns)
            .map((items) => items.length)
            .join('-')}`}
          menus={rows}
          dropdowns={dropdowns}
        />
      )}
    </>
  );
}
