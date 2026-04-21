import { CTA_LINKS, ROUTES } from '@/site';

export type SolutionShowcaseVariant =
  | 'home'
  | 'solutions'
  | 'identity-verification'
  | 'kyb-suite'
  | 'financial-verification'
  | 'video-kyc';

export type ShowcaseIconKey =
  | 'fileText'
  | 'badgeCheck'
  | 'creditCard'
  | 'landmark'
  | 'building2'
  | 'scanFace'
  | 'video'
  | 'penLine'
  | 'shield'
  | 'userCheck'
  | 'briefcase'
  | 'banknote';

export type ShowcaseCard = {
  icon: ShowcaseIconKey;
  title: string;
  description: string;
};

export type ShowcaseVertical = {
  id: string;
  label: string;
  panelTitle: string;
  panelDescription: string;
  cards: ShowcaseCard[];
};

export type SolutionShowcaseData = {
  title: string;
  titleGradient?: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  verticals: ShowcaseVertical[];
};

type Lens = SolutionShowcaseVariant;

function lendingCards(l: Lens): ShowcaseCard[] {
  const id = l === 'identity-verification';
  const kyb = l === 'kyb-suite';
  const fin = l === 'financial-verification';
  const vid = l === 'video-kyc';
  return [
    {
      icon: 'building2',
      title: kyb ? 'MSME registration check' : 'MSME & Udyam verification',
      description: kyb
        ? 'Validate Udyam and establishment details before sanction.'
        : 'Validate Udyam classification and establishment linkage for credit decisions.',
    },
    {
      icon: 'userCheck',
      title: id ? 'Aadhaar eKYC' : 'Identity & bureau signals',
      description: id
        ? 'Paperless KYC with masked Aadhaar and OTP-backed consent.'
        : 'Combine bureau pulls with document checks in one Superflow lane.',
    },
    {
      icon: 'creditCard',
      title: fin ? 'Bank statement intelligence' : 'CIBIL & alternate data',
      description: fin
        ? 'Parse statements for obligation detection and cash-flow signals.'
        : 'Orchestrate bureau consent, soft pulls, and policy thresholds.',
    },
    {
      icon: 'fileText',
      title: fin ? 'ITR & income proofs' : 'Income & employment proofs',
      description: fin
        ? 'Digitize ITRs and Form 16 for underwriting packets.'
        : 'Digitize salary slips, Form 16, and employer confirmations.',
    },
    {
      icon: 'landmark',
      title: 'Bank account verification',
      description: 'Penny drop and account-holder name match before disbursement.',
    },
    {
      icon: vid ? 'video' : 'penLine',
      title: vid ? 'Remote consent capture' : 'eSign & mandate capture',
      description: vid
        ? 'Agent-led steps with recording for high-risk journeys.'
        : 'Stamp-ready eSign and mandate flows with audit trails.',
    },
  ];
}

function insuranceCards(l: Lens): ShowcaseCard[] {
  const id = l === 'identity-verification';
  const kyb = l === 'kyb-suite';
  const vid = l === 'video-kyc';
  return [
    {
      icon: 'shield',
      title: 'Risk & fraud screening',
      description: 'Device, velocity, and identity reuse checks at bind time.',
    },
    {
      icon: 'userCheck',
      title: id ? 'KYC for policies' : 'Policyholder verification',
      description: id
        ? 'PAN, address, and liveness for retail and SME lines.'
        : 'PAN, address proof, and nominee validation in one flow.',
    },
    {
      icon: 'building2',
      title: kyb ? 'Broker & POSP KYB' : 'Intermediary onboarding',
      description: kyb
        ? 'GST, shop license, and IRDAI linkage for distributors.'
        : 'Validate intermediaries before channel payouts.',
    },
    {
      icon: 'fileText',
      title: 'Claims documentation',
      description: 'Structured extraction from invoices and medical forms.',
    },
    {
      icon: 'scanFace',
      title: vid ? 'Video-assisted claims' : 'Liveness & selfie match',
      description: vid
        ? 'Guided capture for high-value claims with audit logs.'
        : 'Passive and active liveness tied to ID portraits.',
    },
    {
      icon: 'penLine',
      title: 'Consent & disclosures',
      description: 'Versioned consent with IP, device, and timestamp evidence.',
    },
  ];
}

function paymentsCards(l: Lens): ShowcaseCard[] {
  const id = l === 'identity-verification';
  const fin = l === 'financial-verification';
  const vid = l === 'video-kyc';
  return [
    {
      icon: 'userCheck',
      title: id ? 'Merchant KYC' : 'Account & merchant onboarding',
      description: id
        ? 'PAN, GSTIN, and bank proofs for sub-merchants.'
        : 'PAN, GSTIN, and bank proofs with watchlist screening.',
    },
    {
      icon: 'creditCard',
      title: 'Instrument verification',
      description: 'BIN metadata, token status, and issuer risk flags.',
    },
    {
      icon: fin ? 'banknote' : 'landmark',
      title: fin ? 'Settlement account checks' : 'Settlement rails',
      description: fin
        ? 'Validate settlement accounts and penny-drop confirmations.'
        : 'Penny drop and IFSC validation for payouts.',
    },
    {
      icon: 'shield',
      title: 'AML & PEP screening',
      description: 'Batch and real-time screening with case management hooks.',
    },
    {
      icon: 'badgeCheck',
      title: 'Chargeback evidence',
      description: 'Collect structured proof packs for dispute windows.',
    },
    {
      icon: vid ? 'video' : 'fileText',
      title: vid ? 'High-risk step-up' : 'Step-up documentation',
      description: vid
        ? 'Escalate to assisted capture when automated checks fail.'
        : 'Request additional proofs without breaking checkout.',
    },
  ];
}

function bankingCards(l: Lens): ShowcaseCard[] {
  const id = l === 'identity-verification';
  const kyb = l === 'kyb-suite';
  const fin = l === 'financial-verification';
  return [
    {
      icon: 'landmark',
      title: 'Account opening stack',
      description: 'Video KYC, CKYC fetch, and eSign in orchestrated order.',
    },
    {
      icon: 'userCheck',
      title: id ? 'Retail KYC refresh' : 'Periodic KYC refresh',
      description: id
        ? 'Re-verify IDs and addresses on trigger events.'
        : 'Re-verify IDs, addresses, and risk scores on cadence.',
    },
    {
      icon: 'building2',
      title: kyb ? 'Corporate onboarding' : 'Corporate KYC',
      description: kyb
        ? 'MCA, UBO, and GST checks for entities and subsidiaries.'
        : 'MCA extracts, UBO graphs, and board resolutions.',
    },
    {
      icon: fin ? 'fileText' : 'briefcase',
      title: fin ? 'Credit memo inputs' : 'Credit memo support',
      description: fin
        ? 'Financial spreads from statements and ITR digitization.'
        : 'Packaged checks for credit committees.',
    },
    {
      icon: 'shield',
      title: 'Fraud & mule detection',
      description: 'Shared signals across channels and geographies.',
    },
    {
      icon: 'scanFace',
      title: 'Assisted verification',
      description: 'Agent consoles with policy prompts and QA sampling.',
    },
  ];
}

function investmentCards(l: Lens): ShowcaseCard[] {
  const id = l === 'identity-verification';
  const kyb = l === 'kyb-suite';
  const fin = l === 'financial-verification';
  return [
    {
      icon: 'userCheck',
      title: id ? 'Investor KYC' : 'Investor suitability',
      description: id
        ? 'PAN, address, and FATCA declarations with evidence.'
        : 'PAN, address, and suitability questionnaires with evidence.',
    },
    {
      icon: 'building2',
      title: kyb ? 'AMC & distributor KYB' : 'Distributor checks',
      description: kyb
        ? 'ARN mapping, GST, and compliance document packs.'
        : 'ARN mapping and compliance attestations.',
    },
    {
      icon: fin ? 'banknote' : 'creditCard',
      title: fin ? 'SIP bank mandates' : 'Mandates & payouts',
      description: fin
        ? 'Validate bank mandates and statement reconciliation.'
        : 'eNACH, penny drop, and payout account controls.',
    },
    {
      icon: 'fileText',
      title: 'Compliance archives',
      description: 'Immutable packets for regulators and internal audit.',
    },
    {
      icon: 'shield',
      title: 'Watchlist & sanctions',
      description: 'Continuous screening with match disposition workflows.',
    },
    {
      icon: 'penLine',
      title: 'eSign for disclosures',
      description: 'Versioned scheme documents with signer attribution.',
    },
  ];
}

function verticalsFor(l: Lens): ShowcaseVertical[] {
  return [
    {
      id: 'lending',
      label: 'Lending',
      panelTitle: 'Lending',
      panelDescription:
        l === 'identity-verification'
          ? 'Identity-first APIs for origination, limit management, and collections with consent-backed data.'
          : l === 'kyb-suite'
            ? 'Business verification for co-borrowers, PGs, and SME portfolios with MCA and GST depth.'
            : l === 'financial-verification'
              ? 'Income and obligation intelligence layered onto bureau and bank data for underwriting.'
              : l === 'video-kyc'
                ? 'Assisted capture for high-ticket loans with V-CIP-ready controls and eSign.'
                : 'Origination, underwriting, and disbursement checks tuned for Indian lending stacks.',
      cards: lendingCards(l),
    },
    {
      id: 'insurance',
      label: 'Insurance',
      panelTitle: 'Insurance',
      panelDescription:
        'Policy issuance, renewals, and claims with identity, KYB, and document automation in one mesh.',
      cards: insuranceCards(l),
    },
    {
      id: 'payments',
      label: 'Payments',
      panelTitle: 'Payments',
      panelDescription:
        'Merchant onboarding, settlement verification, and risk controls aligned to PSP operating models.',
      cards: paymentsCards(l),
    },
    {
      id: 'banking',
      label: 'Banking',
      panelTitle: 'Banking',
      panelDescription:
        'Retail and corporate journeys from account opening through refresh cycles and assisted channels.',
      cards: bankingCards(l),
    },
    {
      id: 'investment',
      label: 'Investment',
      panelTitle: 'Investment',
      panelDescription:
        'AMC, wealth, and broking flows with investor KYC, distributor checks, and disclosure capture.',
      cards: investmentCards(l),
    },
  ];
}

function headerFor(v: SolutionShowcaseVariant): Pick<SolutionShowcaseData, 'title' | 'titleGradient' | 'subtitle'> {
  switch (v) {
    case 'home':
      return {
        title: 'Verification lanes for',
        titleGradient: 'every growth motion',
        subtitle:
          'Pick an industry context, then browse the API clusters SpyBot composes inside Superflow—from identity and KYB to financial proofs and assisted capture.',
      };
    case 'solutions':
      return {
        title: 'Same mesh,',
        titleGradient: 'industry-shaped packs',
        subtitle:
          'These tabs mirror how teams buy verification: by motion first, then by API family. Jump into a brief for deeper architecture notes.',
      };
    case 'identity-verification':
      return {
        title: 'Identity verification',
        titleGradient: 'by industry motion',
        subtitle:
          'See how Aadhaar, PAN, documents, and liveness surface across lending, insurance, payments, banking, and wealth stacks.',
      };
    case 'kyb-suite':
      return {
        title: 'KYB coverage',
        titleGradient: 'mapped to verticals',
        subtitle:
          'MCA, GST, MSME, and UBO checks packaged for the workflows each industry actually runs—not generic tick boxes.',
      };
    case 'financial-verification':
      return {
        title: 'Financial proofs',
        titleGradient: 'where money moves',
        subtitle:
          'Bank statements, ITRs, penny drops, and income signals composed for underwriting, settlements, and treasury controls.',
      };
    case 'video-kyc':
      return {
        title: 'Assisted verification',
        titleGradient: 'when stakes are high',
        subtitle:
          'Video KYC, step-up capture, and eSign mapped to the journeys that still need a human in the loop.',
      };
  }
}

export function getSolutionShowcaseData(variant: SolutionShowcaseVariant): SolutionShowcaseData {
  const h = headerFor(variant);
  return {
    ...h,
    primaryCta: { label: 'Get API key', href: CTA_LINKS.sandbox },
    secondaryCta: { label: 'Contact sales', href: ROUTES.contact },
    verticals: verticalsFor(variant),
  };
}

/** Deep clone for CMS registry defaults and new block drafts (safe to mutate in the admin editor). */
export function getSolutionShowcaseDraft(variant: SolutionShowcaseVariant): SolutionShowcaseData {
  return JSON.parse(JSON.stringify(getSolutionShowcaseData(variant))) as SolutionShowcaseData;
}
