import { footerColumns, socialLinks } from '@/site';
import type { NavMenuItem } from '@/lib/cms/types';

export type CmsFooterCompanyDetails = {
  legalName: string;
  addressLines: string[];
  phone: string;
  cin: string;
  certifications: string[];
};

export type CmsFooterCredit = {
  prefix: string;
  linkLabel: string;
  href: string;
};

export type CmsFooterSettings = {
  columns: Record<string, NavMenuItem[]>;
  socialLinks: NavMenuItem[];
  companyDetails: CmsFooterCompanyDetails;
  trustItems: string[];
  credit: CmsFooterCredit;
};

const DEFAULT_COMPANY_DETAILS: CmsFooterCompanyDetails = {
  legalName: 'SpyBot Verifacts Services Private Limited',
  addressLines: ['#404, 4th Floor, G.V Mall', 'Boring Road, Patna-800001'],
  phone: '7870295295',
  cin: 'U80200BR2023PTC065755',
  certifications: ['ISO 27001:2022', 'ISO 9001:2015'],
};

const DEFAULT_TRUST_ITEMS = ['SOC 2 Type II', ...DEFAULT_COMPANY_DETAILS.certifications, 'UIDAI Certified'];

const DEFAULT_CREDIT: CmsFooterCredit = {
  prefix: 'Design with Love',
  linkLabel: 'EduNex',
  href: 'https://edunexservices.in/',
};

function sanitizeMenuItems(input: unknown): NavMenuItem[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => {
      const label = typeof item?.label === 'string' ? item.label.trim() : '';
      const href = typeof item?.href === 'string' ? item.href.trim() : '';
      if (!label || !href) return null;
      return { label, href };
    })
    .filter((item): item is NavMenuItem => item !== null);
}

function sanitizeStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter((value) => value.length > 0);
}

function sanitizeColumns(input: unknown): Record<string, NavMenuItem[]> {
  if (!input || typeof input !== 'object') return {};
  const out: Record<string, NavMenuItem[]> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const heading = key.trim();
    if (!heading) continue;
    const links = sanitizeMenuItems(value);
    if (links.length > 0) out[heading] = links;
  }
  return out;
}

export function getDefaultFooterSettings(): CmsFooterSettings {
  return {
    columns: Object.fromEntries(
      Object.entries(footerColumns).map(([heading, links]) => [
        heading,
        links.map((link) => ({ label: link.label, href: link.href })),
      ]),
    ),
    socialLinks: socialLinks.map((item) => ({ label: item.label, href: item.href })),
    companyDetails: { ...DEFAULT_COMPANY_DETAILS, addressLines: [...DEFAULT_COMPANY_DETAILS.addressLines], certifications: [...DEFAULT_COMPANY_DETAILS.certifications] },
    trustItems: [...DEFAULT_TRUST_ITEMS],
    credit: { ...DEFAULT_CREDIT },
  };
}

export function normalizeFooterSettings(
  valueJson: unknown,
  legacyColumns?: Record<string, NavMenuItem[]> | null,
): CmsFooterSettings {
  const defaults = getDefaultFooterSettings();
  const source = valueJson && typeof valueJson === 'object' ? (valueJson as Record<string, unknown>) : {};

  const columns = sanitizeColumns(source.columns);
  const social = sanitizeMenuItems(source.socialLinks);
  const addressLines = sanitizeStringArray(source.companyDetails && typeof source.companyDetails === 'object'
    ? (source.companyDetails as Record<string, unknown>).addressLines
    : undefined);
  const certifications = sanitizeStringArray(source.companyDetails && typeof source.companyDetails === 'object'
    ? (source.companyDetails as Record<string, unknown>).certifications
    : undefined);
  const trustItems = sanitizeStringArray(source.trustItems);

  const companySource =
    source.companyDetails && typeof source.companyDetails === 'object'
      ? (source.companyDetails as Record<string, unknown>)
      : {};
  const creditSource =
    source.credit && typeof source.credit === 'object' ? (source.credit as Record<string, unknown>) : {};

  const fallbackColumns =
    Object.keys(columns).length > 0
      ? columns
      : legacyColumns && Object.keys(legacyColumns).length > 0
        ? legacyColumns
        : defaults.columns;

  return {
    columns: fallbackColumns,
    socialLinks: social.length > 0 ? social : defaults.socialLinks,
    companyDetails: {
      legalName:
        (typeof companySource.legalName === 'string' && companySource.legalName.trim()) ||
        defaults.companyDetails.legalName,
      addressLines: addressLines.length > 0 ? addressLines : defaults.companyDetails.addressLines,
      phone:
        (typeof companySource.phone === 'string' && companySource.phone.trim()) ||
        defaults.companyDetails.phone,
      cin:
        (typeof companySource.cin === 'string' && companySource.cin.trim()) ||
        defaults.companyDetails.cin,
      certifications:
        certifications.length > 0 ? certifications : defaults.companyDetails.certifications,
    },
    trustItems: trustItems.length > 0 ? trustItems : defaults.trustItems,
    credit: {
      prefix:
        (typeof creditSource.prefix === 'string' && creditSource.prefix.trim()) || defaults.credit.prefix,
      linkLabel:
        (typeof creditSource.linkLabel === 'string' && creditSource.linkLabel.trim()) ||
        defaults.credit.linkLabel,
      href:
        (typeof creditSource.href === 'string' && creditSource.href.trim()) || defaults.credit.href,
    },
  };
}
