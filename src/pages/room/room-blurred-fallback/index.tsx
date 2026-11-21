import { RoomType } from '@/types/room';

import styles from './styles.module.css';

type Props = {
  previewRoom?: RoomType | null;
};

export const RoomBlurredFallback = ({ previewRoom }: Props) => {
  return (
    <div className={styles.fallbackWrapper} aria-hidden="true">
      <div className={styles.headerBlock}>
        <div className={styles.titleBar}>{previewRoom?.name || 'Название комнаты'}</div>
        <div className={styles.descriptionBar}>
          {previewRoom?.description || 'Совместный бюджет участников'}
        </div>
        <div className={styles.membersPill} />
      </div>

      {[0, 1].map((cardIndex) => (
        <div key={cardIndex} className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <span className={styles.summaryTitle} />
            <span className={styles.summaryPlus} />
          </div>
          <div className={styles.summaryRows}>
            <div className={styles.summaryRow} />
            <div className={styles.summaryRow} />
            <div className={styles.summaryRow} />
          </div>
          <div className={styles.summaryBtn} />
        </div>
      ))}

      <div className={styles.transactionsBlock}>
        <div className={styles.sectionTitle} />
        <div className={styles.transactionRow} />
        <div className={styles.transactionRow} />
      </div>
    </div>
  );
};
