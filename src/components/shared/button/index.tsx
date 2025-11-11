import { Button as HeadlessButton, ButtonProps } from 'react-aria-components';
import cn from 'classnames';

import styles from './styles.module.css';

type ButtonType = ButtonProps & {
  children: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
};

export const Button = ({ children, onClick, type = 'button', className, ...props }: ButtonType) => {
  return (
    <HeadlessButton
      className={cn(styles.button, className)}
      onClick={onClick}
      type={type}
      {...props}
    >
      {children}
    </HeadlessButton>
  );
};
