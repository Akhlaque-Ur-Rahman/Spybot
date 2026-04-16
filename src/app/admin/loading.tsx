import styles from './admin-loading.module.css';

export default function AdminLoading() {
  return (
    <div className={styles.wrap} aria-busy="true" aria-label="Loading CMS">
      <div className={styles.sidebarSk} />
      <div className={styles.mainSk}>
        <div className={styles.bar} />
        <div className={styles.barShort} />
        <div className={styles.grid}>
          <div className={styles.card} />
          <div className={styles.card} />
          <div className={styles.card} />
        </div>
      </div>
    </div>
  );
}
