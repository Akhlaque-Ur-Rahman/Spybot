import PageHeader from '@/components/PageHeader';
import Challenges, { ChallengeItem } from '@/components/Challenges';
import Benefits, { BenefitItem } from '@/components/Benefits';
import Lifecycle, { StepItem } from '@/components/Lifecycle';
import DemoSection from '@/components/DemoSection';
import { SectionScrollReveal } from '@/components/motion/SectionScrollReveal';
import { Landmark, TrendingDown, Clock, ShieldAlert, CircleDollarSign, Receipt, PiggyBank, Search, CheckCircle2 } from 'lucide-react';
import { Metadata } from 'next';
import { CTA_LINKS } from '@/site';

export const metadata: Metadata = {
  title: 'Financial Verification APIs | Penny Drop & Income Analysis',
  description: 'Instantly verify bank accounts and analyze income using our Financial Verification APIs. Automate IMPS Penny Drop and bank statement parsing for lending and onboarding.',
  alternates: {
    canonical: '/solutions/financial-verification',
  },
};

const financialChallenges: ChallengeItem[] = [
  {
    icon: <ShieldAlert size={24} strokeWidth={1.5} />,
    title: 'Payout Failures & Fraud',
    desc: 'Sending payouts to unverified or deactivated bank accounts results in high transaction failure rates and massive financial exposure to fraud.',
    tone: 'danger',
  },
  {
    icon: <Clock size={24} strokeWidth={1.5} />,
    title: 'Manual Statement Analysis',
    desc: 'Lending teams waste days manually reading PDF bank statements to calculate average balances and identify risky transaction patterns.',
    tone: 'warning',
  },
  {
    icon: <TrendingDown size={24} strokeWidth={1.5} />,
    title: 'High Loan Drop-offs',
    desc: 'Lengthy credit assessment processes frustrate borrowers. If you cannot approve a loan instantly, the customer will find a competitor who can.',
    tone: 'info',
  },
];

const financialBenefits: BenefitItem[] = [
  {
    icon: <CircleDollarSign size={32} strokeWidth={1.5} />,
    title: 'IMPS Penny Drop API',
    desc: 'Deposit ₹1 into any Indian bank account to instantly verify if the account is active and return the registered beneficiary name.',
    highlight: 'primary',
  },
  {
    icon: <Receipt size={32} strokeWidth={1.5} />,
    title: 'Bank Statement OCR',
    desc: 'Automatically parse unstructured bank statement PDFs to extract transaction histories, salary deposits, and recurring obligations.',
    highlight: 'teal',
  },
  {
    icon: <PiggyBank size={32} strokeWidth={1.5} />,
    title: 'Income & Risk Scoring',
    desc: 'Generate immediate insights into an applicant’s financial health, calculating average monthly balance (AMB) and spotting loan-bouncing risks.',
    highlight: 'primary',
  },
];

const financialSteps: StepItem[] = [
  {
    num: '01',
    title: 'Account Input',
    desc: 'User provides their Bank Name, Account Number, and IFSC code during onboarding.',
    icon: <Landmark size={28} strokeWidth={1.5} />,
  },
  {
    num: '02',
    title: 'Penny Transfer',
    desc: 'SpyBot initiates an automated background IMPS transfer of ₹1 to the provided account.',
    icon: <CircleDollarSign size={28} strokeWidth={1.5} />,
  },
  {
    num: '03',
    title: 'Status Confirmation',
    desc: 'The bank network confirms transaction success, proving the account is open and active.',
    icon: <CheckCircle2 size={28} strokeWidth={1.5} />,
  },
  {
    num: '04',
    title: 'Name Matching',
    desc: 'We match the returned Bank Beneficiary Name against the user’s Aadhaar/PAN name using fuzzy logic.',
    icon: <Search size={28} strokeWidth={1.5} />,
  },
  {
    num: '05',
    title: 'Secure Payouts',
    desc: 'Proceed with complete confidence to disburse loans, process payroll, or settle B2B vendor payments.',
    icon: <ShieldAlert size={28} strokeWidth={1.5} />, // Reusing an icon for security visual
  },
];

export default function FinancialVerificationPage() {
  return (
    <main>
      <PageHeader 
        label="Financial APIs"
        title="When payout risk slows growth,"
        gradientText="verify financial intent instantly"
        description="Use penny drop validation and income analysis workflows to reduce failed transfers, speed up credit decisions, and improve trust in every payout-linked action."
        primaryCta={{ label: 'Test financial workflows', href: CTA_LINKS.sandbox }}
        secondaryCta={{ label: 'Explore marketplace coverage', href: CTA_LINKS.solutionsCatalog }}
      />
      
      <SectionScrollReveal>
        <Benefits
          label="The Financial Suite"
          title="Intelligent"
          gradientText="Banking APIs"
          subtitle="Eliminate manual underwriting. Our APIs bridge the gap between user identity and their financial reality."
          data={financialBenefits}
        />
      </SectionScrollReveal>

      <SectionScrollReveal>
        <Challenges
          label="The Risk"
          title="Why unverified accounts"
          gradientText="cost millions"
          subtitle="Without real-time financial verification, businesses face severe risks including bounced transfers, money laundering compliance failures, and bad lending decisions."
          data={financialChallenges}
        />
      </SectionScrollReveal>

      <SectionScrollReveal>
        <Lifecycle
          label="Penny Drop Flow"
          title="How account validation"
          gradientText="works"
          subtitle="A massive technical undertaking reduced to a single, sub-second API request."
          data={financialSteps}
        />
      </SectionScrollReveal>

      <DemoSection />
    </main>
  );
}
