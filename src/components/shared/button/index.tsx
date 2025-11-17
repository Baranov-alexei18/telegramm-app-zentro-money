import { ReactNode } from 'react';
import { Button as HeadlessButton, ButtonProps } from 'react-aria-components';
import cn from 'classnames';

import styles from './styles.module.css';

type ButtonType = ButtonProps & {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
  loading?: boolean;
};

export const Button = ({
  children,
  onClick,
  type = 'button',
  className,
  loading = false,
  ...props
}: ButtonType) => {
  return (
    <HeadlessButton
      className={cn(styles.button, className)}
      onClick={onClick}
      type={type}
      {...props}
    >
      {loading ? <div className={styles.spinner} /> : children}
    </HeadlessButton>
  );
};
