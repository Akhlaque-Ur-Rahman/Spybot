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
import { computeOverflowStartIndex } from '@/lib/cms/navigation-utils';
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
import type { HeaderDropdownConfig, NavMenuItem } from '@/lib/cms/types';

type NavDropdownItem = {
  label: string;
  href: string;
  desc: string;
  icon: ReactNode;
};

type CanonicalMenuLabel = 'Company' | 'Industries' | 'Solution' | 'Resources';
type CanonicalMenuGroupKey = 'company' | 'industries' | 'solution' | 'resources';

function toDropdownItems(items: ReadonlyArray<{ label: string; href: string; desc?: string }>): NavDropdownItem[] {
  return items.map((item) => ({
    label: item.label,
    href: item.href,
    desc: item.desc ?? '',
    icon: getNavIcon(item.label),
  }));
}

const defaultDropdownByCanonical: Record<CanonicalMenuLabel, NavDropdownItem[]> = {
  Company: toDropdownItems(companyNavItems),
  Industries: toDropdownItems(industryNavItems),
  Solution: toDropdownItems(solutionNavItems),
  Resources: toDropdownItems(resourceNavItems),
};

function canonicalLabelToGroupKey(label: CanonicalMenuLabel): CanonicalMenuGroupKey {
  if (label === 'Company') return 'company';
  if (label === 'Industries') return 'industries';
  if (label === 'Solution') return 'solution';
  return 'resources';
}

function dropdownGroupKeyForItem(item: NavMenuItem, canonical: CanonicalMenuLabel | null): string {
  if (canonical) return canonicalLabelToGroupKey(canonical);
  const normalized = item.label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized;
}

type NavLink = {
  id: string;
  label: string;
  href: string;
  dropdown?: NavDropdownItem[];
  canonicalLabel?: CanonicalMenuLabel | null;
};

const navLinks: NavLink[] = [
  {
    id: 'company',
    label: 'Company',
    href: ROUTES.home,
    dropdown: defaultDropdownByCanonical.Company,
    canonicalLabel: 'Company',
  },
  {
    id: 'industries',
    label: 'Industries',
    href: ROUTES.industries,
    dropdown: defaultDropdownByCanonical.Industries,
    canonicalLabel: 'Industries',
  },
  {
    id: 'solution',
    label: 'Solution',
    href: ROUTES.solutions,
    dropdown: defaultDropdownByCanonical.Solution,
    canonicalLabel: 'Solution',
  },
  {
    id: 'resources',
    label: 'Resources',
    href: ROUTES.resources,
    dropdown: defaultDropdownByCanonical.Resources,
    canonicalLabel: 'Resources',
  },
];

function slugify(label: string) {
  return label.toLowerCase().replace(/\s+/g, '-');
}

function navOverviewCopy(label: CanonicalMenuLabel | null | undefined) {
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

function defaultLinkByCanonical(label: CanonicalMenuLabel) {
  return navLinks.find((link) => link.canonicalLabel === label) ?? null;
}

function resolveDropdownItems(
  item: NavMenuItem,
  canonical: CanonicalMenuLabel | null,
  dropdownConfig?: HeaderDropdownConfig
): NavDropdownItem[] | undefined {
  const defaults = canonical ? defaultDropdownByCanonical[canonical] : undefined;
  if (!dropdownConfig) return defaults;
  const group = dropdownConfig[dropdownGroupKeyForItem(item, canonical)];
  if (!group?.length) return defaults;
  const parsed = group
    .map((item) => ({
      label: item.label.trim(),
      href: item.href.trim(),
      desc: (item.description ?? '').trim(),
    }))
    .filter((item) => item.label && item.href)
    .map((item) => ({ ...item, icon: getNavIcon(item.label) }));
  if (!parsed.length) return defaults;
  if (!defaults?.length) return parsed;

  const seen = new Set(defaults.map((item) => `${item.href.toLowerCase()}|${item.label.toLowerCase()}`));
  const merged = [...defaults];
  for (const item of parsed) {
    const key = `${item.href.toLowerCase()}|${item.label.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }
  return merged;
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

function mergeMenuWithDefaults(items: NavMenuItem[], dropdownConfig?: HeaderDropdownConfig): NavLink[] {
  const resolved = items
    .map((item, index) => {
      const canonical = canonicalMenuLabel(item);
      const defaultLink = canonical ? defaultLinkByCanonical(canonical) : null;
      const label = item.label.trim() || defaultLink?.label || 'Untitled';
      const href = item.href.trim() || defaultLink?.href || ROUTES.home;

      return {
        id: canonical ? `${canonical.toLowerCase()}-${index}` : `${slugify(label)}-${index}`,
        label,
        href,
        dropdown: resolveDropdownItems(item, canonical, dropdownConfig),
        canonicalLabel: canonical,
      } satisfies NavLink;
    })
    .filter((item) => item.label && item.href);

  return resolved.length ? resolved : navLinks;
}

export default function Navbar({
  menuItems,
  utilityMenuItems,
  dropdownConfig,
  enableOverflow = true,
  primaryCtaHref = CTA_LINKS.demo,
  primaryCtaText = 'Book a Demo',
}: {
  menuItems?: NavMenuItem[];
  utilityMenuItems?: NavMenuItem[];
  dropdownConfig?: HeaderDropdownConfig;
  enableOverflow?: boolean;
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
  const navLinksRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const hadMobileOpen = useRef(false);
  const prevPathname = useRef<string | null>(null);
  const [overflowStartIdx, setOverflowStartIdx] = useState<number | null>(null);
  const reserveMoreWidth = 92;

  const resolvedLinks: NavLink[] = menuItems?.length ? mergeMenuWithDefaults(menuItems, dropdownConfig) : navLinks;
  const visibleLinks = !enableOverflow || overflowStartIdx === null ? resolvedLinks : resolvedLinks.slice(0, overflowStartIdx);
  const overflowLinks = !enableOverflow || overflowStartIdx === null ? [] : resolvedLinks.slice(overflowStartIdx);
  const hasOverflow = overflowLinks.length > 0;
  const moreDropdownItems: NavDropdownItem[] = overflowLinks.map((link) => ({
    label: link.label,
    href: link.href,
    desc: '',
    icon: <Layers key={`more-${link.id}`} size={18} strokeWidth={1.5} />,
  }));

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
    const measure = () => {
      const container = navLinksRef.current;
      if (!container) {
        setOverflowStartIdx(null);
        return;
      }
      if (!enableOverflow) {
        setOverflowStartIdx(null);
        return;
      }
      const desktopOnly = window.matchMedia('(min-width: 769px)').matches;
      if (!desktopOnly) {
        setOverflowStartIdx(null);
        return;
      }
      const widths = resolvedLinks.map((link) => linkRefs.current[link.id]?.offsetWidth ?? 0);
      if (widths.some((w) => w <= 0)) return;

      const availableWidth = container.clientWidth;
      setOverflowStartIdx(computeOverflowStartIndex(widths, availableWidth, reserveMoreWidth));
    };

    const timeout = window.setTimeout(measure, 0);
    const onResize = () => measure();
    window.addEventListener('resize', onResize);

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => measure()) : null;
    if (ro && navLinksRef.current) ro.observe(navLinksRef.current);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('resize', onResize);
      ro?.disconnect();
    };
  }, [resolvedLinks, enableOverflow]);

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
                        key={link.id}
                        href={link.href}
                        className={styles.mobileLink}
                        onClick={closeMobileMenu}
                      >
                        {link.label}
                      </Link>
                    );
                  }
                  const overview = navOverviewCopy(link.canonicalLabel);
                  return (
                    <details key={link.id} className={styles.mobileDisclosure}>
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
          <div ref={navLinksRef} className={styles.navLinks} role="menubar">
            {visibleLinks.map((link) => {
              const dropdownSlug = slugify(link.id);
              const hasDropdown = Boolean(link.dropdown?.length);
              const overview = navOverviewCopy(link.canonicalLabel);

              return (
                <div
                  key={link.id}
                  ref={(el) => {
                    linkRefs.current[link.id] = el;
                  }}
                  className={`${styles.navItem} ${activeDropdown === link.id ? styles.navItemOpen : ''}`}
                  data-dropdown-root={hasDropdown ? link.id : undefined}
                  onMouseEnter={() => hasDropdown && setActiveDropdown(link.id)}
                  onMouseLeave={() => hasDropdown && closeDropdown()}
                >
                  {hasDropdown ? (
                    <button
                      type="button"
                      className={styles.navLink}
                      role="menuitem"
                      id={`nav-trigger-${dropdownSlug}`}
                      aria-haspopup="true"
                      aria-expanded={activeDropdown === link.id}
                      aria-controls={`nav-menu-${dropdownSlug}`}
                      onClick={() =>
                        setActiveDropdown((d) => (d === link.id ? null : link.id))
                      }
                      onFocus={() => setActiveDropdown(link.id)}
                    >
                      {link.label}
                      <ChevronDown size={14} className={styles.chevron} aria-hidden="true" />
                    </button>
                  ) : (
                    <Link href={link.href} className={styles.navLink} role="menuitem">
                      {link.label}
                    </Link>
                  )}

                  {hasDropdown && activeDropdown === link.id && (
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
            {hasOverflow ? (
              <div
                ref={(el) => {
                  linkRefs.current.more = el;
                }}
                className={`${styles.navItem} ${activeDropdown === 'more' ? styles.navItemOpen : ''}`}
                data-dropdown-root="more"
                onMouseEnter={() => setActiveDropdown('more')}
                onMouseLeave={closeDropdown}
              >
                <button
                  type="button"
                  className={styles.navLink}
                  role="menuitem"
                  id="nav-trigger-more"
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === 'more'}
                  aria-controls="nav-menu-more"
                  onClick={() => setActiveDropdown((d) => (d === 'more' ? null : 'more'))}
                  onFocus={() => setActiveDropdown('more')}
                >
                  More
                  <ChevronDown size={14} className={styles.chevron} aria-hidden="true" />
                </button>
                {activeDropdown === 'more' ? (
                  <div className={styles.dropdownShell} role="presentation">
                    <div
                      id="nav-menu-more"
                      className={styles.dropdown}
                      role="menu"
                      aria-label="More submenu"
                      aria-labelledby="nav-trigger-more"
                    >
                      <div className={styles.dropdownGrid}>
                        {moreDropdownItems.map((item) => (
                          <Link
                            key={`${item.label}-${item.href}`}
                            href={item.href}
                            className={styles.dropdownItem}
                            role="menuitem"
                            onClick={closeDropdown}
                          >
                            <span className={styles.dropdownIcon} aria-hidden="true">
                              {item.icon}
                            </span>
                            <div>
                              <div className={styles.dropdownLabel}>{item.label}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* CTA buttons */}
          <div className={styles.navCtas}>
            <Link href={CTA_LINKS.sandbox} className="btn btn-secondary btn-sm" aria-label="Get sandbox access">Get Sandbox Access</Link>
            <Link href={primaryCtaHref} className="btn btn-primary btn-sm" aria-label={primaryCtaText}>{primaryCtaText}</Link>
            <ThemeToggle />
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
