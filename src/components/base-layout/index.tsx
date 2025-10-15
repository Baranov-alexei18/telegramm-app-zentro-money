import { Outlet } from 'react-router';

import { NavigationMenu } from '../navigation-menu';

export const LayoutApp = () => {
  // Footer для мобилки добавить
  return (
    <div style={{ height: '100%' }}>
      <Outlet />
      <NavigationMenu />
    </div>
  );
};
