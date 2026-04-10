import styles from './SupportSlaStrip.module.css';

export default function SupportSlaStrip() {
  return (
    <section className={styles.section} aria-labelledby="sla-heading">
      <div className="container">
        <h2 id="sla-heading" className={styles.heading}>
          How we respond
        </h2>
        <ul className={styles.grid}>
          <li className={styles.card}>
            <span className={styles.kicker}>Production issues</span>
            <p className={styles.value}>Prioritized triage</p>
            <p className={styles.note}>
              Share environment, request IDs, and the exact verification step. We route API and workflow issues to the right specialist.
            </p>
          </li>
          <li className={styles.card}>
            <span className={styles.kicker}>Implementation</span>
            <p className={styles.value}>Guided rollout</p>
            <p className={styles.note}>
              Sandbox validation, routing rules, and review-queue tuning are handled as working sessions—not generic ticket replies.
            </p>
          </li>
          <li className={styles.card}>
            <span className={styles.kicker}>Escalation</span>
            <p className={styles.value}>Security & compliance</p>
            <p className={styles.note}>
              Procurement questionnaires, audit evidence, and data-handling questions go through our security review path.
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}
