import { ReactNode } from 'react';
import { NavLink } from 'react-router';
import cn from 'classnames';

import styles from './styles.module.css';

type LinkButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export const LinkButton = ({ href, children, className }: LinkButtonProps) => {
  return (
    <NavLink className={cn(styles.link, className)} to={href}>
      {children}
    </NavLink>
  );
};
