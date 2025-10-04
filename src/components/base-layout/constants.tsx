import { NavLink } from 'react-router';

import { ROUTE_PATHS } from '../../constants/route-path';

export const MENU_ITEMS = [
  {
    key: 'home',
    icon: <div />,
    label: (
      <NavLink to={ROUTE_PATHS.rooms} end>
        Главная
      </NavLink>
    ),
  },
  {
    key: 'income',
    icon: <div />,
    label: (
      <NavLink to={ROUTE_PATHS.rooms} end>
        Доходы
      </NavLink>
    ),
  },
  {
    key: 'goals',
    icon: <div />,
    label: (
      <NavLink to={ROUTE_PATHS.main} end>
        Цели
      </NavLink>
    ),
  },
];
