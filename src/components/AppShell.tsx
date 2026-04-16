'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { NavMenuItem } from '@/lib/cms/types';

type AppShellProps = {
  children: React.ReactNode;
  headerMenu: NavMenuItem[];
  footerMenu: Record<string, NavMenuItem[]>;
  primaryCtaHref?: string;
  primaryCtaText?: string;
};

export default function AppShell({
  children,
  headerMenu,
  footerMenu,
  primaryCtaHref,
  primaryCtaText,
}: AppShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar
        menuItems={headerMenu}
        primaryCtaHref={primaryCtaHref}
        primaryCtaText={primaryCtaText}
      />
      {children}
      <Footer cmsColumns={footerMenu} />
    </>
  );
}
