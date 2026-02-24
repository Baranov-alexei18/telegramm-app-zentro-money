import { Fragment, ReactNode } from 'react';
import { Header as HeaderAria } from 'react-aria-components';
import cn from 'classnames';

import { OfflineBanner } from '../offline-banner';

import styles from './styles.module.css';

type HeaderProps = {
  className?: string;
  children: ReactNode;
};

export const Header = ({ children, className }: HeaderProps) => {
  return (
    <Fragment>
      <HeaderAria className={cn(styles.header, className)}>{children}</HeaderAria>
      <OfflineBanner />
    </Fragment>
  );
};
