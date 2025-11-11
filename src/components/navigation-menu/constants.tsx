import { ReactNode } from 'react';

import { HouseIcon } from '../icons/house-icon';
import { SquaresIcon } from '../icons/squares-icon';
import { UserIcon } from '../icons/user-icon';

export type NavItem = {
  name: string;
  href: string;
  icon: ReactNode;
};

export const navItems: NavItem[] = [
  {
    name: 'Главная',
    href: '/',
    icon: <HouseIcon />,
  },
  {
    name: 'Комнаты',
    href: '/rooms',
    icon: <SquaresIcon />,
  },
  {
    name: 'Профиль',
    href: '/profile',
    icon: <UserIcon />,
  },
];
