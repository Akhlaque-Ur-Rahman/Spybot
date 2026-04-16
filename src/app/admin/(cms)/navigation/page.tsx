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
      <p className={pageStyles.lead}>Reorder links, edit labels and URLs, then save each menu.</p>
      {rows.length === 0 ? (
        <EmptyState title="No menus" description="Run the database seed to create the default header menu." />
      ) : (
        <NavigationEditorClient key={rows.map((m) => `${m.id}-${m.items.length}`).join('|')} menus={rows} />
      )}
    </>
  );
}
