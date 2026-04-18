import styles from './SupportPathways.module.css';
import richTextStyles from '@/components/CmsRichText.module.css';
import { Headphones, Mail, Clock, Shield } from 'lucide-react';
import Link from 'next/link';
import { renderCmsIcon, type CmsIconName } from '@/lib/cms/icon-map';
import { ROUTES } from '@/site';
import type { CmsRichTextValue } from '@/lib/cms/rich-text';
import { renderCmsRichText } from '@/lib/cms/rich-text';

const pathways = [
  {
    icon: <Headphones size={22} strokeWidth={1.5} />,
    title: 'Product & integration help',
    desc: 'API questions, sandbox issues, and workflow debugging for engineering and product teams.',
    action: { label: 'Browse FAQs first', href: ROUTES.faq },
  },
  {
    icon: <Mail size={22} strokeWidth={1.5} />,
    title: 'Sales & solutions',
    desc: 'Architecture reviews, procurement questions, and rollout planning with our solutions team.',
    action: { label: 'Contact sales', href: ROUTES.contact },
  },
  {
    icon: <Clock size={22} strokeWidth={1.5} />,
    title: 'Operational reviews',
    desc: 'Tune verification thresholds, manual review queues, and fraud response playbooks.',
    action: { label: 'Book a working session', href: `${ROUTES.contact}#demo` },
  },
  {
    icon: <Shield size={22} strokeWidth={1.5} />,
    title: 'Security & compliance',
    desc: 'Data handling, audit evidence, and security questionnaires for enterprise procurement.',
    action: { label: 'Request security pack', href: ROUTES.contact },
  },
];

type SupportPathwayItem = {
  icon: CmsIconName;
  title: string;
  desc: CmsRichTextValue;
  action: { label: string; href: string };
};

export default function SupportPathways({
  heading = 'Pick the right',
  gradientText = 'path',
  subheading = 'Different questions need different owners. Route your request so you get a faster, more precise answer.',
  items,
}: {
  heading?: string;
  gradientText?: string;
  subheading?: CmsRichTextValue;
  items?: SupportPathwayItem[];
}) {
  const resolvedItems = items
    ? items.map((item) => ({
        ...item,
        icon: renderCmsIcon(item.icon),
      }))
    : pathways;

  return (
    <section className={styles.section} aria-labelledby="support-pathways-heading">
      <div className="container">
        <h2 id="support-pathways-heading" className={styles.heading}>
          {heading} <span className="text-gradient">{gradientText}</span>
        </h2>
        <div className={`${styles.sub} ${richTextStyles.prose}`}>{renderCmsRichText(subheading)}</div>
        <div className={styles.grid}>
          {resolvedItems.map((p) => (
            <article key={p.title} className={styles.card}>
              <div className={styles.icon} aria-hidden="true">
                {p.icon}
              </div>
              <h3 className={styles.title}>{p.title}</h3>
              <div className={`${styles.desc} ${richTextStyles.prose}`}>{renderCmsRichText(p.desc)}</div>
              <Link href={p.action.href} className={styles.link}>
                {p.action.label} →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
