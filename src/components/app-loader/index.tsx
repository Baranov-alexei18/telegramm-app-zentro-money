import { LogoLoader } from '@/components/shared/logo-loader';

import styles from './styles.module.css';

export const AppLoader = () => {
  return (
    <div className={styles.loaderWrapper}>
      <LogoLoader size={72} />
      <p className={styles.caption}>Загрузка данных...</p>
    </div>
  );
};
