'use client';
import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';
import ThemeToggle from './ThemeToggle';
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
  ChevronDown
} from 'lucide-react';

const navLinks = [
  { label: 'API Marketplace', href: '#marketplace' },
  {
    label: 'Solutions',
    href: '#solutions',
    dropdown: [
      { label: 'Identity Verification', href: '/solutions/identity-verification', icon: <BadgeCheck size={18} strokeWidth={1.5} />, desc: 'Aadhaar, PAN, Voter ID validation' },
      { label: 'KYB Suite', href: '/solutions/kyb-suite', icon: <Building2 size={18} strokeWidth={1.5} />, desc: 'MCA, GST, and MSME checks' },
      { label: 'Financial Verification', href: '/solutions/financial-verification', icon: <Landmark size={18} strokeWidth={1.5} />, desc: 'Penny Drop & Income Analysis' },
      { label: 'Video KYC & eSign', href: '/solutions/video-kyc', icon: <Video size={18} strokeWidth={1.5} />, desc: 'V-CIP KYC and seamless digital signatures' },
    ],
  },
  {
    label: 'Industries',
    href: '/industries',
    dropdown: [
      { label: 'Fintech & Banks', href: '/industries/fintech', icon: <CreditCard size={18} strokeWidth={1.5} />, desc: 'Instant lending and account opening' },
      { label: 'E-commerce', href: '/industries/ecommerce', icon: <ShoppingCart size={18} strokeWidth={1.5} />, desc: 'Vendor onboarding & fraud prevention' },
      { label: 'Telecom', href: '/industries/telecom', icon: <Smartphone size={18} strokeWidth={1.5} />, desc: 'SIM issuance and compliance' },
      { label: 'Gaming', href: '/industries/gaming', icon: <Gamepad2 size={18} strokeWidth={1.5} />, desc: 'Age verification and RMG compliance' },
    ],
  },
  { label: 'Resources', href: '#resources' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
            <a href="#support" aria-label="Go to Support">Support</a>
            <span>|</span>
            <a href="#contact" aria-label="Contact Sales Team">Contact Sales</a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`} aria-label="Main Navigation">
        <div className={`container ${styles.navInner}`}>
          {/* Logo */}
          <a href="/" className={styles.logo} aria-label="SpyBot Homepage">
            <div className={styles.logoIcon} aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="#1E8FE1" strokeWidth="1.5"/>
                <circle cx="14" cy="14" r="5" fill="#0B72CC" opacity="0.8"/>
                <circle cx="14" cy="14" r="2" fill="#10BDB2"/>
                <line x1="14" y1="9" x2="14" y2="2" stroke="#1E8FE1" strokeWidth="1.5" opacity="0.6"/>
              </svg>
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoName}>SpyBot</span>
              <span className={styles.logoSub}>DIGITAL IDENTITY</span>
            </div>
          </a>

          {/* Desktop links */}
          <div className={styles.navLinks} role="menubar">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className={styles.navItem}
                onMouseEnter={() => link.dropdown && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <a 
                  href={link.href} 
                  className={styles.navLink} 
                  role="menuitem"
                  aria-haspopup={link.dropdown ? 'true' : 'false'}
                  aria-expanded={activeDropdown === link.label}
                >
                  {link.label}
                  {link.dropdown && <ChevronDown size={14} className={styles.chevron} aria-hidden="true" />}
                </a>
                {link.dropdown && activeDropdown === link.label && (
                  <div className={styles.dropdown} role="menu" aria-label={`${link.label} submenu`}>
                    {link.dropdown.map((item) => (
                      <a key={item.label} href={item.href || '#'} className={styles.dropdownItem} role="menuitem">
                        <span className={styles.dropdownIcon} aria-hidden="true">{item.icon}</span>
                        <div>
                          <div className={styles.dropdownLabel}>{item.label}</div>
                          <div className={styles.dropdownDesc}>{item.desc}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className={styles.navCtas}>
            <ThemeToggle />
            <a href="#apikeys" className="btn btn-secondary btn-sm" aria-label="Get API Keys">Get API Keys</a>
            <a href="#demo" className="btn btn-primary btn-sm" aria-label="Book a Demo">Book a Demo</a>
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
            {navLinks.map((link) => (
              <a 
                key={link.label} 
                href={link.href} 
                className={styles.mobileLink} 
                onClick={() => setMobileOpen(false)}
                role="menuitem"
              >
                {link.label}
              </a>
            ))}
            <div className={styles.mobileCtas}>
              <ThemeToggle />
              <a href="#apikeys" className="btn btn-secondary" aria-label="Get API Keys">Get API Keys</a>
              <a href="#demo" className="btn btn-primary" aria-label="Book a Demo">Book a Demo</a>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
