'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  CloudUpload,
  FileText,
  History,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Menu,
  PanelBottom,
  Search,
  Settings,
  Users,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { AdminApiProvider } from '@/components/admin/AdminApiContext';
import styles from './AdminShell.module.css';

const links: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: '/admin', label: 'Overview', Icon: LayoutDashboard },
  { href: '/admin/guide', label: 'Guide', Icon: BookOpen },
  { href: '/admin/content', label: 'Content', Icon: FileText },
  { href: '/admin/media', label: 'Media', Icon: ImageIcon },
  { href: '/admin/navigation', label: 'Navigation', Icon: Menu },
  { href: '/admin/footer', label: 'Footer', Icon: PanelBottom },
  { href: '/admin/seo', label: 'SEO', Icon: Search },
  { href: '/admin/forms', label: 'Forms', Icon: Inbox },
  { href: '/admin/users', label: 'Users', Icon: Users },
  { href: '/admin/settings', label: 'Settings', Icon: Settings },
  { href: '/admin/publish', label: 'Publish', Icon: CloudUpload },
  { href: '/admin/audit', label: 'Audit', Icon: History },
];

const iconProps = { size: 18, strokeWidth: 1.75 } as const;

export default function AdminShell({
  csrfToken,
  children,
}: {
  csrfToken: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <AdminApiProvider csrfToken={csrfToken}>
      {drawerOpen ? (
        <button
          type="button"
          className={styles.overlay}
          aria-label="Close menu"
          onClick={() => setDrawerOpen(false)}
        />
      ) : null}
      <div className={styles.shell}>
        <aside
          id="cms-sidebar"
          className={`${styles.sidebar} ${drawerOpen ? styles.sidebarOpen : ''}`}
        >
          <p className={styles.brand}>SpyBot CMS</p>
          <div className={styles.sidebarBody}>
            <nav className={styles.nav} aria-label="CMS sections">
              {links.map((link) => {
                const active =
                  link.href === '/admin'
                    ? pathname === '/admin'
                    : pathname === link.href || pathname.startsWith(`${link.href}/`);
                const Icon = link.Icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    title={link.label}
                    className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <span className={styles.navIcon} aria-hidden="true">
                      <Icon {...iconProps} />
                    </span>
                    <span className={styles.navLabel}>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className={styles.sidebarFooter}>
            <span className={styles.userEmail}>{session?.user?.email ?? '—'}</span>
            <span className={styles.roleBadge}>{session?.user?.role ?? '—'}</span>
            <button
              type="button"
              className={styles.logout}
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
            >
              Sign out
            </button>
          </div>
        </aside>
        <section className={styles.main}>
          <button
            type="button"
            className={styles.menuToggle}
            onClick={() => setDrawerOpen((o) => !o)}
            aria-expanded={drawerOpen}
            aria-controls="cms-sidebar"
          >
            Menu
          </button>
          {children}
        </section>
      </div>
    </AdminApiProvider>
  );
}
