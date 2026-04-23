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
      <p className={pageStyles.lead}>Manage site settings.</p>
      {rows.length === 0 ? (
        <EmptyState title="No settings" description="No settings found." />
      ) : (
        <SettingsEditorClient settings={rows} />
      )}
    </>
  );
}
