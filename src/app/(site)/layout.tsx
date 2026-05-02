import AppShell from '@/components/AppShell';
import {
  getFooterSettings,
  getHeaderDropdownConfig,
  getGlobalSettings,
  getHeaderMenu,
  getHeaderUtilityMenu,
} from '@/lib/cms/service';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const enableNavEnhancements = process.env.NEXT_PUBLIC_NAV_ENHANCED !== '0';
  const [headerMenu, headerUtilityMenu, headerDropdownConfig, footerSettings, globalSettings] = await Promise.all([
    getHeaderMenu(),
    getHeaderUtilityMenu(),
    getHeaderDropdownConfig(),
    getFooterSettings(),
    getGlobalSettings<{ primaryCtaHref?: string; primaryCtaText?: string; secondaryCtaHref?: string; secondaryCtaText?: string; siteName?: string; supportEmail?: string }>(),
  ]);

  return (
    <AppShell
      headerMenu={headerMenu}
      headerUtilityMenu={headerUtilityMenu}
      headerDropdownConfig={enableNavEnhancements ? headerDropdownConfig : undefined}
      enableNavEnhancements={enableNavEnhancements}
      footerSettings={footerSettings}
      primaryCtaHref={globalSettings.primaryCtaHref}
      primaryCtaText={globalSettings.primaryCtaText}
      secondaryCtaHref={globalSettings.secondaryCtaHref}
      secondaryCtaText={globalSettings.secondaryCtaText}
    >
      {children}
    </AppShell>
  );
}
