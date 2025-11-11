import { NavLink } from 'react-router';
import cn from 'classnames';

import styles from './styles.module.css';

type LinkButtonProps = {
  href: string;
  children: string;
  className?: string;
};

export const LinkButton = ({ href, children, className }: LinkButtonProps) => {
  return (
    <NavLink className={cn(styles.link, className)} to={href}>
      {children}
    </NavLink>
  );
};
