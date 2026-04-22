import FooterEditorClient from '@/components/admin/pages/FooterEditorClient';
import pageStyles from '@/components/admin/adminPage.module.css';
import { normalizeFooterSettings } from '@/lib/cms/footer-settings';
import { prisma } from '@/lib/db/prisma';
import type { NavMenuItem } from '@/lib/cms/types';

export default async function AdminFooterPage() {
  const [configRow, columnsRow] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { key: 'footer-config' } }),
    prisma.siteSetting.findUnique({ where: { key: 'footer-columns' } }),
  ]);
  const legacyColumns = (columnsRow?.valueJson as Record<string, NavMenuItem[]> | undefined) ?? null;
  const footer = normalizeFooterSettings(configRow?.valueJson, legacyColumns);

  return (
    <>
      <h1 className={pageStyles.pageTitle}>Footer</h1>
      <p className={pageStyles.lead}>Manage all footer content.</p>
      <FooterEditorClient footer={footer} />
    </>
  );
}
