import { useOnlineStatus } from '@/hooks/useOnlineStatus';

import styles from './styles.module.css';

export const OfflineBanner = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className={styles.banner}>
      <span className={styles.icon}>🌐</span>
      <div className={styles.text}>
        <strong>Офлайн-режим</strong>
        <span>Изменения сохранятся локально</span>
      </div>
    </div>
  );
};
