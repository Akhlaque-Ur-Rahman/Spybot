'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageEntranceOverlay from '@/components/PageEntranceOverlay';
import type { NavMenuItem } from '@/lib/cms/types';
import shellStyles from './AppShell.module.css';

type AppShellProps = {
  children: React.ReactNode;
  headerMenu: NavMenuItem[];
  headerUtilityMenu?: NavMenuItem[];
  footerMenu: Record<string, NavMenuItem[]>;
  primaryCtaHref?: string;
  primaryCtaText?: string;
};

export default function AppShell({
  children,
  headerMenu,
  headerUtilityMenu,
  footerMenu,
  primaryCtaHref,
  primaryCtaText,
}: AppShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  const [entranceVisible, setEntranceVisible] = useState(true);
  const [entranceDone, setEntranceDone] = useState(false);
  const [routeAnim, setRouteAnim] = useState(false);
  const pathPrimed = useRef(false);

  const onEntranceDismiss = useCallback(() => {
    setEntranceVisible(false);
    setEntranceDone(true);
  }, []);

  useEffect(() => {
    if (!entranceDone) return;
    if (!pathPrimed.current) {
      pathPrimed.current = true;
      return;
    }
    let timeoutId: ReturnType<typeof window.setTimeout> | undefined;
    const rafId = requestAnimationFrame(() => {
      setRouteAnim(true);
      timeoutId = window.setTimeout(() => setRouteAnim(false), 400);
    });
    return () => {
      cancelAnimationFrame(rafId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [pathname, entranceDone]);

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar
        menuItems={headerMenu}
        utilityMenuItems={headerUtilityMenu}
        primaryCtaHref={primaryCtaHref}
        primaryCtaText={primaryCtaText}
      />
      <div
        className={`${shellStyles.pageStage} ${routeAnim ? shellStyles.pageStageRouteIn : ''}`}
      >
        {children}
      </div>
      <Footer cmsColumns={footerMenu} />
      {entranceVisible ? <PageEntranceOverlay onDismiss={onEntranceDismiss} /> : null}
    </>
  );
}
