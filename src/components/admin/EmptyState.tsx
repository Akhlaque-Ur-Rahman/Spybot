import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className={styles.wrap}>
      <p className={styles.title}>{title}</p>
      {description ? <p className={styles.desc}>{description}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
