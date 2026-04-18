import styles from './ContactHighlights.module.css';
import richTextStyles from '@/components/CmsRichText.module.css';
import { MessageSquare, Timer, Shield } from 'lucide-react';
import { renderCmsIcon, type CmsIconName } from '@/lib/cms/icon-map';
import type { CmsRichTextValue } from '@/lib/cms/rich-text';
import { renderCmsRichText } from '@/lib/cms/rich-text';

const items = [
  {
    icon: <MessageSquare size={22} strokeWidth={1.5} />,
    title: 'Structured discovery',
    desc: 'We map your funnel, risk model, and compliance constraints before recommending checks and orchestration.',
  },
  {
    icon: <Timer size={22} strokeWidth={1.5} />,
    title: 'Fast follow-up',
    desc: 'Expect a focused reply with next steps—whether that is sandbox access, a solution workshop, or security review.',
  },
  {
    icon: <Shield size={22} strokeWidth={1.5} />,
    title: 'Enterprise-ready',
    desc: 'Discuss audit trails, data handling, and operational controls with teams who work on regulated onboarding daily.',
  },
];

type ContactHighlightItem = {
  icon: CmsIconName;
  title: string;
  desc: CmsRichTextValue;
};

export default function ContactHighlights({
  heading = 'What happens',
  gradientText = 'after you reach out',
  highlightItems,
}: {
  heading?: string;
  gradientText?: string;
  highlightItems?: ContactHighlightItem[];
}) {
  const resolvedItems = highlightItems
    ? highlightItems.map((item) => ({
        ...item,
        icon: renderCmsIcon(item.icon),
      }))
    : items;

  return (
    <section className={styles.section} aria-labelledby="contact-highlights-heading">
      <div className="container">
        <h2 id="contact-highlights-heading" className={styles.heading}>
          {heading} <span className="text-gradient">{gradientText}</span>
        </h2>
        <ul className={styles.grid}>
          {resolvedItems.map((it) => (
            <li key={it.title} className={styles.card}>
              <span className={styles.icon} aria-hidden="true">
                {it.icon}
              </span>
              <h3 className={styles.title}>{it.title}</h3>
              <div className={`${styles.desc} ${richTextStyles.prose}`}>{renderCmsRichText(it.desc)}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
