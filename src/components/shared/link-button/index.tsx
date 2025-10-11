import { Link } from 'react-router';
import cn from 'classnames';

import styles from './styles.module.css';

type LinkButtonProps = {
  href: string;
  children: string;
  className?: string;
};

export const LinkButton = ({ href, children, className }: LinkButtonProps) => {
  return (
    <Link className={cn(styles.link, className)} to={href}>
      {children}
    </Link>
  );
};
