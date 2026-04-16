import SettingsEditorClient, { type SettingRow } from '@/components/admin/pages/SettingsEditorClient';
import EmptyState from '@/components/admin/EmptyState';
import pageStyles from '@/components/admin/adminPage.module.css';
import { prisma } from '@/lib/db/prisma';

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSetting.findMany({ orderBy: { key: 'asc' } });
  const rows: SettingRow[] = settings.map((s) => ({
    id: s.id,
    key: s.key,
    valueJson: s.valueJson as unknown,
  }));

  return (
    <>
      <h1 className={pageStyles.pageTitle}>Global Settings</h1>
      <p className={pageStyles.lead}>Edit site settings as JSON. Invalid JSON will be rejected on save.</p>
      {rows.length === 0 ? (
        <EmptyState title="No settings" description="Seed the database or create a setting via API." />
      ) : (
        <SettingsEditorClient settings={rows} />
      )}
    </>
  );
}
