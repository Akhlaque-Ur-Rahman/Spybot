'use client';
import Link from 'next/link';
import { Fragment, useState, useEffect, useCallback, type ReactNode } from 'react';
import styles from './Navbar.module.css';
import ThemeToggle from './ThemeToggle';
import BrandLogoMark from '@/components/BrandLogoMark';
import { CTA_LINKS, ROUTES, industryNavItems, solutionNavItems } from '@/site';
import {
  BadgeCheck,
  Building2,
  Landmark,
  Video,
  CreditCard,
  ShoppingCart,
  Smartphone,
  Gamepad2,
  ShieldCheck,
  ChevronDown,
  Layers
} from 'lucide-react';
import type { NavMenuItem } from '@/lib/cms/types';

type NavDropdownItem = {
  label: string;
  href: string;
  desc: string;
  icon: ReactNode;
};

type NavLink = {
  label: string;
  href: string;
  dropdown?: NavDropdownItem[];
};

const navLinks: NavLink[] = [
  { label: 'API Marketplace', href: ROUTES.apiMarketplace },
  {
    label: 'Solutions',
    href: ROUTES.solutions,
    dropdown: solutionNavItems.map((item, index) => ({
      ...item,
      icon: [
        <BadgeCheck key="identity" size={18} strokeWidth={1.5} />,
        <Building2 key="kyb" size={18} strokeWidth={1.5} />,
        <Landmark key="financial" size={18} strokeWidth={1.5} />,
        <Video key="video" size={18} strokeWidth={1.5} />,
      ][index],
    })),
  },
  {
    label: 'Industries',
    href: ROUTES.industries,
    dropdown: industryNavItems.map((item, index) => ({
      ...item,
      icon: [
        <CreditCard key="fintech" size={18} strokeWidth={1.5} />,
        <ShoppingCart key="ecommerce" size={18} strokeWidth={1.5} />,
        <Smartphone key="telecom" size={18} strokeWidth={1.5} />,
        <Gamepad2 key="gaming" size={18} strokeWidth={1.5} />,
      ][index],
    })),
  },
  { label: 'Resources', href: ROUTES.resources },
  { label: 'FAQ', href: ROUTES.faq },
];

function slugify(label: string) {
  return label.toLowerCase().replace(/\s+/g, '-');
}

export default function Navbar({
  menuItems,
  utilityMenuItems,
  primaryCtaHref = CTA_LINKS.demo,
  primaryCtaText = 'Book a Demo',
}: {
  menuItems?: NavMenuItem[];
  utilityMenuItems?: NavMenuItem[];
  primaryCtaHref?: string;
  primaryCtaText?: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const resolvedLinks: NavLink[] = menuItems?.length
    ? menuItems.map((item) => ({ label: item.label, href: item.href }))
    : navLinks;

  const closeDropdown = useCallback(() => setActiveDropdown(null), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!activeDropdown) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveDropdown(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeDropdown]);

  useEffect(() => {
    if (!activeDropdown) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const root = target.closest('[data-dropdown-root]');
      if (root?.getAttribute('data-dropdown-root') === activeDropdown) return;
      setActiveDropdown(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [activeDropdown]);

  useEffect(() => {
    if (!activeDropdown) return;
    const el = document.querySelector(`[data-dropdown-root="${CSS.escape(activeDropdown)}"]`);
    if (!(el instanceof HTMLElement)) return;
    const onFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget as Node | null;
      if (next && el.contains(next)) return;
      setActiveDropdown(null);
    };
    el.addEventListener('focusout', onFocusOut);
    return () => el.removeEventListener('focusout', onFocusOut);
  }, [activeDropdown]);

  return (
    <>
      {/* Utility bar */}
      <div className={styles.topBar}>
        <div className={`container ${styles.topBarInner}`}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} strokeWidth={2} />
            Bank-grade security, trusted by leading enterprises
          </span>
          <div className={styles.topLinks}>
            {utilityMenuItems?.length ? (
              utilityMenuItems.map((item, i) => (
                <Fragment key={`${item.href}-${item.label}`}>
                  {i > 0 ? <span>|</span> : null}
                  <Link href={item.href}>{item.label}</Link>
                </Fragment>
              ))
            ) : (
              <>
                <Link href={ROUTES.support} aria-label="Go to Support">
                  Support
                </Link>
                <span>|</span>
                <Link href={ROUTES.contact} aria-label="Contact Sales Team">
                  Contact Sales
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`} aria-label="Main Navigation">
        <div className={`container ${styles.navInner}`}>
          {/* Logo */}
          <Link href={ROUTES.home} className={styles.logo} aria-label="SpyBot homepage">
            <BrandLogoMark width={160} height={40} plain decorative sizes="160px" priority />
          </Link>

          {/* Desktop links */}
          <div className={styles.navLinks} role="menubar">
            {resolvedLinks.map((link) => {
              const dropdownSlug = slugify(link.label);
              const hasDropdown = Boolean(link.dropdown);

              return (
                <div
                  key={link.label}
                  className={`${styles.navItem} ${activeDropdown === link.label ? styles.navItemOpen : ''}`}
                  data-dropdown-root={hasDropdown ? link.label : undefined}
                  onMouseEnter={() => hasDropdown && setActiveDropdown(link.label)}
                  onMouseLeave={() => hasDropdown && closeDropdown()}
                >
                  {hasDropdown ? (
                    <button
                      type="button"
                      className={styles.navLink}
                      role="menuitem"
                      id={`nav-trigger-${dropdownSlug}`}
                      aria-haspopup="true"
                      aria-expanded={activeDropdown === link.label}
                      aria-controls={`nav-menu-${dropdownSlug}`}
                      onClick={() =>
                        setActiveDropdown((d) => (d === link.label ? null : link.label))
                      }
                      onFocus={() => setActiveDropdown(link.label)}
                    >
                      {link.label}
                      <ChevronDown size={14} className={styles.chevron} aria-hidden="true" />
                    </button>
                  ) : (
                    <Link href={link.href} className={styles.navLink} role="menuitem">
                      {link.label}
                    </Link>
                  )}

                  {hasDropdown && activeDropdown === link.label && (
                    <div className={styles.dropdownShell} role="presentation">
                      <div
                        id={`nav-menu-${dropdownSlug}`}
                        className={styles.dropdown}
                        role="menu"
                        aria-label={`${link.label} submenu`}
                        aria-labelledby={`nav-trigger-${dropdownSlug}`}
                      >
                        <Link
                          href={link.href}
                          className={styles.dropdownItem}
                          role="menuitem"
                          onClick={closeDropdown}
                        >
                          <span className={styles.dropdownIcon} aria-hidden="true">
                            <Layers size={18} strokeWidth={1.5} />
                          </span>
                          <div>
                            <div className={styles.dropdownLabel}>
                              {link.label === 'Solutions' ? 'All solutions' : 'All industries'}
                            </div>
                            <div className={styles.dropdownDesc}>
                              {link.label === 'Solutions'
                                ? 'Browse the full solution catalog'
                                : 'Browse industry playbooks and use cases'}
                            </div>
                          </div>
                        </Link>
                        {link.dropdown!.map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            className={styles.dropdownItem}
                            role="menuitem"
                            onClick={closeDropdown}
                          >
                            <span className={styles.dropdownIcon} aria-hidden="true">{item.icon}</span>
                            <div>
                              <div className={styles.dropdownLabel}>{item.label}</div>
                              <div className={styles.dropdownDesc}>{item.desc}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA buttons */}
          <div className={styles.navCtas}>
            <ThemeToggle />
            <Link href={CTA_LINKS.sandbox} className="btn btn-secondary btn-sm" aria-label="Get sandbox access">Get Sandbox Access</Link>
            <Link href={primaryCtaHref} className="btn btn-primary btn-sm" aria-label={primaryCtaText}>{primaryCtaText}</Link>
          </div>

          {/* Hamburger */}
          <button
            className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close mobile menu" : "Open mobile menu"}
            aria-expanded={mobileOpen}
          >
            <span aria-hidden="true"/><span aria-hidden="true"/><span aria-hidden="true"/>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className={styles.mobileMenu} role="menu">
            {resolvedLinks.map((link) => (
            <Link 
                key={link.label} 
                href={link.href} 
                className={styles.mobileLink} 
                onClick={() => setMobileOpen(false)}
                role="menuitem"
              >
                {link.label}
              </Link>
            ))}
            <div className={styles.mobileCtas}>
              <ThemeToggle />
              <Link href={CTA_LINKS.sandbox} className="btn btn-secondary" aria-label="Get sandbox access">Get Sandbox Access</Link>
              <Link href={primaryCtaHref} className="btn btn-primary" aria-label={primaryCtaText}>{primaryCtaText}</Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
