import styles from './Challenges.module.css';
import { TrendingDown, UserX, Timer, Blocks, Settings, Globe } from 'lucide-react';
import React from 'react';

export interface ChallengeItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}

export const defaultChallenges: ChallengeItem[] = [
  {
    icon: <TrendingDown size={24} strokeWidth={1.5} />,
    title: 'High Onboarding Drop-offs',
    desc: 'Complex KYC forms cause a 40% drop-off rate. SpyBot’s instant verification SDKs slash onboarding time to under 60 seconds.',
    color: '#EF4444',
  },
  {
    icon: <UserX size={24} strokeWidth={1.5} />,
    title: 'Fraud & Impersonation',
    desc: 'Deepfakes and forged documents are on the rise. We stop fraud at the gate with AI liveness detection and data tampering checks.',
    color: '#F59E0B',
  },
  {
    icon: <Timer size={24} strokeWidth={1.5} />,
    title: 'Developer Bottlenecks',
    desc: 'Building custom KYC flows takes months of engineering. Launch instantly with Superflow, our no-code workflow orchestration builder.',
    color: '#3B82F6',
  },
  {
    icon: <Blocks size={24} strokeWidth={1.5} />,
    title: 'Fragmented Providers',
    desc: 'Juggling different APIs for ID, banking, and background checks is a nightmare. Get everything under one unified roof with SpyBot.',
    color: '#10BDB2',
  },
  {
    icon: <Settings size={24} strokeWidth={1.5} />,
    title: 'Manual KYC Processes',
    desc: 'Manual verification doesn’t scale and introduces severe human error. SpyBot automates 95% of identity and document screening.',
    color: '#8B5CF6',
  },
  {
    icon: <Globe size={24} strokeWidth={1.5} />,
    title: 'Global Compliance Hurdles',
    desc: 'Expanding globally means new ID formats. We securely process passports, Emirates IDs, and RC checks across borders.',
    color: '#22C55E',
  },
];

interface ChallengesProps {
  label?: string;
  title?: React.ReactNode;
  gradientText?: string;
  subtitle?: string;
  data?: ChallengeItem[];
}

export default function Challenges({
  label = "The Problem",
  title = "Traditional Onboarding is",
  gradientText = "Broken",
  subtitle = "Outdated KYC processes lose customers and drain resources. SpyBot gives you the identity intelligence advantage to onboard fast and securely.",
  data = defaultChallenges
}: ChallengesProps) {
  return (
    <section className={styles.section} id="challenges">
      <div className={`glow-orb glow-orb-blue ${styles.glow}`} style={{ width: 400, height: 400 }} aria-hidden="true" />
      <div className="container">
        <div className={styles.header}>
          <p className="section-label">{label}</p>
          <h2 className="section-title">
            {title}{' '}
            {gradientText && <span className="text-gradient">{gradientText}</span>}
          </h2>
          <p className="section-subtitle" style={{ marginTop: 16 }}>
            {subtitle}
          </p>
        </div>

        <div className={`grid-3 ${styles.grid}`}>
          {data.map((c, i) => (
            <div key={c.title} className={styles.card} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={styles.cardIcon} style={{ background: c.color + '18', border: `1px solid ${c.color}40`, color: c.color }} aria-hidden="true">
                {c.icon}
              </div>
              <h3 className={styles.cardTitle}>{c.title}</h3>
              <p className={styles.cardDesc}>{c.desc}</p>
              <div className={styles.cardAccent} style={{ background: c.color }} aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
