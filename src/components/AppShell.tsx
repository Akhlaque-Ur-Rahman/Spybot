'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton';
import GoToTopButton from '@/components/GoToTopButton';
import type { HeaderDropdownConfig, NavMenuItem } from '@/lib/cms/types';
import type { CmsFooterSettings } from '@/lib/cms/footer-settings';
import shellStyles from './AppShell.module.css';

type AppShellProps = {
  children: React.ReactNode;
  headerMenu: NavMenuItem[];
  headerUtilityMenu?: NavMenuItem[];
  headerDropdownConfig?: HeaderDropdownConfig;
  enableNavEnhancements?: boolean;
  footerSettings: CmsFooterSettings;
  primaryCtaHref?: string;
  primaryCtaText?: string;
  secondaryCtaHref?: string;
  secondaryCtaText?: string;
};

export default function AppShell({
  children,
  headerMenu,
  headerUtilityMenu,
  headerDropdownConfig,
  enableNavEnhancements,
  footerSettings,
  primaryCtaHref,
  primaryCtaText,
  secondaryCtaHref,
  secondaryCtaText,
}: AppShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className={shellStyles.shellChrome}>
      <Navbar
        menuItems={headerMenu}
        utilityMenuItems={headerUtilityMenu}
        dropdownConfig={headerDropdownConfig}
        enableOverflow={enableNavEnhancements}
        primaryCtaHref={primaryCtaHref}
        primaryCtaText={primaryCtaText}
        secondaryCtaHref={secondaryCtaHref}
        secondaryCtaText={secondaryCtaText}
      />
      <div className={shellStyles.pageStage}>{children}</div>
      <Footer cmsFooter={footerSettings} />
      <GoToTopButton />
      <WhatsAppFloatingButton phoneNumber="917870295295" />
    </div>
  );
}
