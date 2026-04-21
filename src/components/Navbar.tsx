'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { Fragment, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import styles from './Navbar.module.css';
import ThemeToggle from './ThemeToggle';
import BrandLogoMark from '@/components/BrandLogoMark';
import {
  CTA_LINKS,
  ROUTES,
  companyNavItems,
  industryNavItems,
  resourceNavItems,
  solutionNavItems,
} from '@/site';
import {
  BadgeCheck,
  BookOpen,
  Briefcase,
  Building2,
  CreditCard,
  Landmark,
  ChevronDown,
  FileSearch,
  HelpCircle,
  Home,
  Info,
  Layers,
  PhoneCall,
  ScrollText,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  TrendingUp,
  Users,
  Video,
  Wallet,
  X,
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
  {
    label: 'Company',
    href: ROUTES.home,
    dropdown: companyNavItems.map((item) => ({
      ...item,
      icon: getNavIcon(item.label),
    })),
  },
  {
    label: 'Industries',
    href: ROUTES.industries,
    dropdown: industryNavItems.map((item) => ({
      ...item,
      icon: getNavIcon(item.label),
    })),
  },
  {
    label: 'Solution',
    href: ROUTES.solutions,
    dropdown: solutionNavItems.map((item) => ({
      ...item,
      icon: getNavIcon(item.label),
    })),
  },
  {
    label: 'Resources',
    href: ROUTES.resources,
    dropdown: resourceNavItems.map((item) => ({
      ...item,
      icon: getNavIcon(item.label),
    })),
  },
];

function slugify(label: string) {
  return label.toLowerCase().replace(/\s+/g, '-');
}

function navOverviewCopy(label: string) {
  switch (label) {
    case 'Company':
      return {
        title: 'Company overview',
        desc: 'Start from the company overview page',
      };
    case 'Industries':
      return {
        title: 'All industries',
        desc: 'Browse industry playbooks and use cases',
      };
    case 'Resources':
      return {
        title: 'All resources',
        desc: 'Browse certifications, content, and FAQs',
      };
    default:
      return {
        title: 'All solutions',
        desc: 'Browse the full solution catalog',
      };
  }
}

function normalizeLabel(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');
}

function canonicalMenuLabel(item: NavMenuItem) {
  const label = normalizeLabel(item.label);
  const href = item.href.trim().toLowerCase();

  if (label === 'company' || href === ROUTES.home) return 'Company';
  if (label === 'industries' || href === ROUTES.industries) return 'Industries';
  if (label === 'solution' || label === 'solutions' || href === ROUTES.solutions) return 'Solution';
  if (label === 'resources' || href === ROUTES.resources) return 'Resources';

  return null;
}

function getNavIcon(label: string) {
  const iconProps = { size: 18, strokeWidth: 1.5 } as const;

  switch (label) {
    case 'Home':
      return <Home key={label} {...iconProps} />;
    case 'About Us':
      return <Info key={label} {...iconProps} />;
    case 'Career':
      return <Briefcase key={label} {...iconProps} />;
    case 'Why SpyBot':
      return <ShieldCheck key={label} {...iconProps} />;
    case 'Contact Us':
      return <PhoneCall key={label} {...iconProps} />;
    case 'Insurance':
      return <ShieldCheck key={label} {...iconProps} />;
    case 'NBFC':
    case 'Fintech':
      return <CreditCard key={label} {...iconProps} />;
    case 'Banks':
      return <Landmark key={label} {...iconProps} />;
    case 'Staffing':
      return <Users key={label} {...iconProps} />;
    case 'Telecom':
      return <Smartphone key={label} {...iconProps} />;
    case 'Trading':
      return <TrendingUp key={label} {...iconProps} />;
    case 'E-commerce':
      return <ShoppingCart key={label} {...iconProps} />;
    case 'Identity Verification':
      return <BadgeCheck key={label} {...iconProps} />;
    case 'Business Verification':
      return <Building2 key={label} {...iconProps} />;
    case 'Income Verification':
      return <Wallet key={label} {...iconProps} />;
    case 'Video KYC':
      return <Video key={label} {...iconProps} />;
    case 'CKYC Platform':
      return <FileSearch key={label} {...iconProps} />;
    case 'Certifications & Accreditations':
      return <ScrollText key={label} {...iconProps} />;
    case 'Blog':
      return <BookOpen key={label} {...iconProps} />;
    case 'Case Studies':
      return <Layers key={label} {...iconProps} />;
    case 'FAQs':
      return <HelpCircle key={label} {...iconProps} />;
    default:
      return <Layers key={label} {...iconProps} />;
  }
}

function mergeMenuWithDefaults(items: NavMenuItem[]): NavLink[] {
  const overrides = new Map<string, NavMenuItem>();
  for (const item of items) {
    const canonical = canonicalMenuLabel(item);
    if (canonical && !overrides.has(canonical)) {
      overrides.set(canonical, item);
    }
  }

  return navLinks.map((link) => {
    const override = overrides.get(link.label);
    if (!override) return link;

    return {
      ...link,
      href: override.href || link.href,
    };
  });
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
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerEntered, setDrawerEntered] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const hadMobileOpen = useRef(false);
  const prevPathname = useRef<string | null>(null);

  const resolvedLinks: NavLink[] = menuItems?.length ? mergeMenuWithDefaults(menuItems) : navLinks;

  const closeDropdown = useCallback(() => setActiveDropdown(null), []);

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false);
    setDrawerEntered(false);
    closeDropdown();
  }, [closeDropdown]);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      queueMicrotask(() => setDrawerEntered(false));
      return;
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setDrawerEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileMenu();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen, closeMobileMenu]);

  useEffect(() => {
    if (prevPathname.current === null) {
      prevPathname.current = pathname;
      return;
    }
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      queueMicrotask(() => closeMobileMenu());
    }
  }, [pathname, closeMobileMenu]);

  useEffect(() => {
    if (mobileOpen) {
      hadMobileOpen.current = true;
      const t = window.setTimeout(() => closeButtonRef.current?.focus(), 40);
      return () => window.clearTimeout(t);
    }
    if (hadMobileOpen.current) {
      hadMobileOpen.current = false;
      menuButtonRef.current?.focus();
    }
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const panel = drawerRef.current;
    if (!panel) return;

    const selector =
      'a[href], button:not([disabled]), summary, textarea, input, select, [tabindex]:not([tabindex="-1"])';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const list = [...panel.querySelectorAll<HTMLElement>(selector)].filter(
        (el) => el.offsetParent !== null || el.getClientRects().length > 0,
      );
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    panel.addEventListener('keydown', onKeyDown);
    return () => panel.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

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

  const mobileDrawer =
    mounted && mobileOpen
      ? createPortal(
            <div
              ref={drawerRef}
              id="mobile-nav-drawer"
              className={`${styles.mobileMenuOverlay} ${drawerEntered ? styles.mobileMenuOverlayVisible : ''}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-nav-drawer-title"
            >
              <h2 id="mobile-nav-drawer-title" className="sr-only">
                Menu
              </h2>
              <div className={styles.mobileMenuHeader}>
                <Link
                  href={ROUTES.home}
                  className={styles.mobileMenuLogo}
                  onClick={closeMobileMenu}
                  aria-label="SpyBot homepage"
                >
                  <BrandLogoMark width={160} height={40} plain decorative sizes="160px" />
                </Link>
                <button
                  ref={closeButtonRef}
                  type="button"
                  className={styles.mobileDrawerClose}
                  onClick={closeMobileMenu}
                  aria-label="Close menu"
                >
                  <X size={22} strokeWidth={2} aria-hidden />
                </button>
              </div>
              <div className={styles.mobileDrawerScroll}>
                {resolvedLinks.map((link) => {
                  if (!link.dropdown?.length) {
                    return (
                      <Link
                        key={link.label}
                        href={link.href}
                        className={styles.mobileLink}
                        onClick={closeMobileMenu}
                      >
                        {link.label}
                      </Link>
                    );
                  }
                  const overview = navOverviewCopy(link.label);
                  return (
                    <details key={link.label} className={styles.mobileDisclosure}>
                      <summary>
                        <span>{link.label}</span>
                        <ChevronDown size={18} className={styles.mobileDisclosureChevron} aria-hidden />
                      </summary>
                      <div className={styles.mobileSublist}>
                        <Link
                          href={link.href}
                          className={`${styles.mobileSublink} ${styles.mobileSublinkOverview}`}
                          onClick={closeMobileMenu}
                        >
                          <span className={styles.mobileSublinkIcon} aria-hidden>
                            <Layers size={18} strokeWidth={1.5} />
                          </span>
                          <span className={styles.mobileSublinkText}>
                            <span className={styles.mobileSublinkLabel}>{overview.title}</span>
                            <span className={styles.mobileSublinkDesc}>{overview.desc}</span>
                          </span>
                        </Link>
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            className={styles.mobileSublink}
                            onClick={closeMobileMenu}
                          >
                            <span className={styles.mobileSublinkIcon} aria-hidden>
                              {item.icon}
                            </span>
                            <span className={styles.mobileSublinkText}>
                              <span className={styles.mobileSublinkLabel}>{item.label}</span>
                              <span className={styles.mobileSublinkDesc}>{item.desc}</span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    </details>
                  );
                })}
              </div>
              <div className={styles.mobileDrawerFooter}>
                <ThemeToggle />
                <div className={styles.mobileDrawerFooterCtas}>
                  <Link
                    href={CTA_LINKS.sandbox}
                    className="btn btn-secondary"
                    aria-label="Get sandbox access"
                    onClick={closeMobileMenu}
                  >
                    Get Sandbox Access
                  </Link>
                  <Link
                    href={primaryCtaHref}
                    className="btn btn-primary"
                    aria-label={primaryCtaText}
                    onClick={closeMobileMenu}
                  >
                    {primaryCtaText}
                  </Link>
                </div>
              </div>
            </div>,
          document.body,
        )
      : null;

  return (
    <>
      {mobileDrawer}
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
      <nav
        className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}
        aria-label="Main Navigation"
      >
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
              const overview = navOverviewCopy(link.label);

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
                          className={`${styles.dropdownItem} ${styles.dropdownOverview}`}
                          role="menuitem"
                          onClick={closeDropdown}
                        >
                          <span className={styles.dropdownIcon} aria-hidden="true">
                            <Layers size={18} strokeWidth={1.5} />
                          </span>
                          <div>
                            <div className={styles.dropdownLabel}>{overview.title}</div>
                            <div className={styles.dropdownDesc}>{overview.desc}</div>
                          </div>
                        </Link>
                        <div className={styles.dropdownGrid}>
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
            ref={menuButtonRef}
            type="button"
            className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ''}`}
            onClick={() => (mobileOpen ? closeMobileMenu() : setMobileOpen(true))}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
          >
            <span aria-hidden="true"/><span aria-hidden="true"/><span aria-hidden="true"/>
          </button>
        </div>
      </nav>
    </>
  );
}
