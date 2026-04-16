'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState, type ReactNode } from 'react';
import { AdminApiProvider } from '@/components/admin/AdminApiContext';
import styles from './AdminShell.module.css';

const links = [
  { href: '/admin', label: 'Overview', short: '◉' },
  { href: '/admin/content', label: 'Content', short: '§' },
  { href: '/admin/media', label: 'Media', short: '▣' },
  { href: '/admin/navigation', label: 'Navigation', short: '≡' },
  { href: '/admin/seo', label: 'SEO', short: '◎' },
  { href: '/admin/forms', label: 'Forms', short: '✉' },
  { href: '/admin/users', label: 'Users', short: '👤' },
  { href: '/admin/settings', label: 'Settings', short: '⚙' },
  { href: '/admin/publish', label: 'Publish', short: '▶' },
  { href: '/admin/audit', label: 'Audit', short: '⌚' },
];

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
          <h1 className={styles.brand}>SpyBot CMS</h1>
          <nav className={styles.nav} aria-label="CMS sections">
            {links.map((link) => {
              const active =
                link.href === '/admin'
                  ? pathname === '/admin'
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                  onClick={() => setDrawerOpen(false)}
                >
                  <span aria-hidden="true">{link.short} </span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
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
