import { NavLink } from 'react-router';

import { ROUTE_PATHS } from '../../constants/route-path';

export const MENU_ITEMS = [
  {
    key: 'home',
    icon: <div />,
    label: (
      <NavLink to={ROUTE_PATHS.home} end>
        Главная
      </NavLink>
    ),
  },
  {
    key: 'income',
    icon: <div />,
    label: (
      <NavLink to={ROUTE_PATHS.income} end>
        Доходы
      </NavLink>
    ),
  },
  {
    key: 'expense',
    icon: <div />,
    label: (
      <NavLink to={ROUTE_PATHS.expense} end>
        Расходы
      </NavLink>
    ),
  },
  {
    key: 'goals',
    icon: <div />,
    label: (
      <NavLink to={ROUTE_PATHS.goals} end>
        Цели
      </NavLink>
    ),
  },
];
