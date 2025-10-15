import { ReactNode } from 'react';

export type NavItem = {
  name: string;
  href: string;
  icon: ReactNode;
};

export const navItems: NavItem[] = [
  {
    name: 'Главная',
    href: '/',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12L12 3l9 9v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-9z" />
      </svg>
    ),
  },
  {
    name: 'Транзакции',
    href: '/transactions',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
  {
    name: 'Комнаты',
    href: '/rooms',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      </svg>
    ),
  },
  {
    name: 'Профиль',
    href: '/profile',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="4" />
        <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      </svg>
    ),
  },
];
