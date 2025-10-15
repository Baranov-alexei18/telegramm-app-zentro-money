import { Button as HeadlessButton } from 'react-aria-components';
import cn from 'classnames';

import styles from './styles.module.css';

type ButtonProps = {
  children: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
};

export const Button = ({ children, onClick, type = 'button', className }: ButtonProps) => {
  return (
    <HeadlessButton className={cn(styles.button, className)} onClick={onClick} type={type}>
      {children}
    </HeadlessButton>
  );
};
