import { ReactNode } from 'react';
import { Header as HeaderAria } from 'react-aria-components';

import styles from './styles.module.css';

type HeaderProps = {
  children: ReactNode;
};

export const Header = ({ children }: HeaderProps) => {
  return <HeaderAria className={styles.header}>{children}</HeaderAria>;
};
