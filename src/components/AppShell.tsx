'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageEntranceOverlay from '@/components/PageEntranceOverlay';
import SciFiLoaderCanvas from '@/components/loaders/SciFiLoaderCanvas';
import type { HeaderDropdownConfig, NavMenuItem } from '@/lib/cms/types';
import shellStyles from './AppShell.module.css';

type AppShellProps = {
  children: React.ReactNode;
  headerMenu: NavMenuItem[];
  headerUtilityMenu?: NavMenuItem[];
  headerDropdownConfig?: HeaderDropdownConfig;
  enableNavEnhancements?: boolean;
  footerMenu: Record<string, NavMenuItem[]>;
  primaryCtaHref?: string;
  primaryCtaText?: string;
};

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia(reducedMotionQuery);
  mq.addEventListener('change', onStoreChange);
  return () => mq.removeEventListener('change', onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(reducedMotionQuery).matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export default function AppShell({
  children,
  headerMenu,
  headerUtilityMenu,
  headerDropdownConfig,
  enableNavEnhancements,
  footerMenu,
  primaryCtaHref,
  primaryCtaText,
}: AppShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  const [entranceVisible, setEntranceVisible] = useState(true);
  const [entranceDone, setEntranceDone] = useState(false);
  const [routeAnim, setRouteAnim] = useState(false);
  const [routeLoader, setRouteLoader] = useState(false);
  const pathPrimed = useRef(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

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
    let timeoutAnim: number | undefined;
    let timeoutLoader: number | undefined;
    const rafId = requestAnimationFrame(() => {
      setRouteAnim(true);
      setRouteLoader(true);
      timeoutAnim = window.setTimeout(() => setRouteAnim(false), 400);
      timeoutLoader = window.setTimeout(() => setRouteLoader(false), 440);
    });
    return () => {
      cancelAnimationFrame(rafId);
      if (timeoutAnim !== undefined) window.clearTimeout(timeoutAnim);
      if (timeoutLoader !== undefined) window.clearTimeout(timeoutLoader);
    };
  }, [pathname, entranceDone]);

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <div className={!entranceDone ? `shellMarketingBooting ${shellStyles.shellChrome}` : shellStyles.shellChrome}>
        <Navbar
          menuItems={headerMenu}
          utilityMenuItems={headerUtilityMenu}
          dropdownConfig={headerDropdownConfig}
          enableOverflow={enableNavEnhancements}
          primaryCtaHref={primaryCtaHref}
          primaryCtaText={primaryCtaText}
        />
        <div
          className={`${shellStyles.pageStage} ${routeAnim ? shellStyles.pageStageRouteIn : ''}`}
        >
          {children}
        </div>
        <Footer cmsColumns={footerMenu} />
      </div>
      {routeLoader ? (
        <div className={shellStyles.routeLoaderDock} aria-hidden>
          <SciFiLoaderCanvas
            variant="route"
            active
            reducedMotion={reducedMotion}
            className={shellStyles.routeLoaderCanvas}
          />
        </div>
      ) : null}
      {entranceVisible ? <PageEntranceOverlay onDismiss={onEntranceDismiss} /> : null}
    </>
  );
}
