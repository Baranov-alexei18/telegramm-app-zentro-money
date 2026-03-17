import { ReactNode } from 'react';
import { Icon } from '@iconify/react';

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
    icon: <Icon icon="proicons:home" height={28} width={28} />,
  },
  {
    name: 'Комнаты',
    href: '/rooms',
    icon: <Icon icon="glyphs:grid-list-bold" height={28} width={28} />,
  },
  {
    name: 'Профиль',
    href: '/profile',
    icon: <Icon icon="glyphs:user-bold" height={28} width={28} />,
  },
];
