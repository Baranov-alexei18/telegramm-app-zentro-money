import { Outlet } from 'react-router';

import { NavigationMenu } from '../navigation-menu';

import styles from './styles.module.css';

export const LayoutApp = () => {
  // Footer для мобилки добавить
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <Outlet />
      </div>
      <NavigationMenu />
    </div>
  );
};
