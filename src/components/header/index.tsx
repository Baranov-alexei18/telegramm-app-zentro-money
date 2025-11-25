import { ReactNode } from 'react';
import { Header as HeaderAria } from 'react-aria-components';
import cn from 'classnames';

import styles from './styles.module.css';

type HeaderProps = {
  className?: string;
  children: ReactNode;
};

export const Header = ({ children, className }: HeaderProps) => {
  return <HeaderAria className={cn(styles.header, className)}>{children}</HeaderAria>;
};
