import styles from './SupportSlaStrip.module.css';
import { resolveCardDesignClass, type CardDesignVariant } from '@/lib/ui/card-design';

type SlaCard = {
  kicker: string;
  value: string;
  note: string;
};

export default function SupportSlaStrip({
  heading = 'How we respond',
  cards = [
    {
      kicker: 'Production issues',
      value: 'Prioritized triage',
      note:
        'Share environment, request IDs, and the exact verification step. We route API and workflow issues to the right specialist.',
    },
    {
      kicker: 'Implementation',
      value: 'Guided rollout',
      note:
        'Sandbox validation, routing rules, and review-queue tuning are handled as working sessions-not generic ticket replies.',
    },
    {
      kicker: 'Escalation',
      value: 'Security & compliance',
      note:
        'Procurement questionnaires, audit evidence, and data-handling questions go through our security review path.',
    },
  ],
  cardDesign,
}: {
  heading?: string;
  cards?: SlaCard[];
  cardDesign?: CardDesignVariant;
}) {
  const resolvedCardDesign = resolveCardDesignClass(cardDesign ?? 'carddesign2');
  return (
    <section className={styles.section} aria-labelledby="sla-heading">
      <div className="container">
        <h2 id="sla-heading" className={styles.heading}>
          {heading}
        </h2>
        <ul className={styles.grid}>
          {cards.map((card) => (
            <li key={card.kicker} className={`${styles.card} ${resolvedCardDesign}`}>
              <span className={styles.kicker}>{card.kicker}</span>
              <p className={styles.value}>{card.value}</p>
              <p className={styles.note}>{card.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
