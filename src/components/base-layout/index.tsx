import { Outlet } from 'react-router';

import { NavigationMenu } from '@/components/navigation-menu';

import styles from './styles.module.css';

export const LayoutApp = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <Outlet />
      </div>
      <NavigationMenu />
    </div>
  );
};
