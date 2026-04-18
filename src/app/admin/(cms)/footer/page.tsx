import FooterEditorClient from '@/components/admin/pages/FooterEditorClient';
import pageStyles from '@/components/admin/adminPage.module.css';
import { getFooterColumnsSetting } from '@/lib/cms/page-registry';
import { prisma } from '@/lib/db/prisma';
import type { NavMenuItem } from '@/lib/cms/types';

export default async function AdminFooterPage() {
  const row = await prisma.siteSetting.findUnique({ where: { key: 'footer-columns' } });
  const columns =
    (row?.valueJson as Record<string, NavMenuItem[]> | undefined) ?? getFooterColumnsSetting();

  return (
    <>
      <h1 className={pageStyles.pageTitle}>Footer</h1>
      <p className={pageStyles.lead}>Column headings and links for the public footer.</p>
      <FooterEditorClient columns={columns} />
    </>
  );
}
