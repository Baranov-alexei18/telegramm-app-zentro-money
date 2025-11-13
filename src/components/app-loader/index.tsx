import React from 'react';

import styles from './styles.module.css';

export const AppLoader = () => {
  return (
    <div className={styles.loaderWrapper}>
      <div className={styles.spinner}></div>
      <p>Начальная загрузка данных...</p>
    </div>
  );
};
