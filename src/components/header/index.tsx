import { ReactNode } from 'react';
import { Header as HeaderAria } from 'react-aria-components';
import cn from 'classnames';

import styles from './styles.module.css';

type Props = {
  className?: string;
  children: ReactNode;
};

export const Header = ({ children, className }: Props) => {
  return <HeaderAria className={cn(styles.header, className)}>{children}</HeaderAria>;
};
