import cn from 'classnames';

import { LogoLoader } from '@/components/shared/logo-loader';

import styles from './styles.module.css';

type Props = {
  overlay?: boolean;
  className?: string;
};

export const AppLoader = ({ overlay = false, className }: Props) => {
  return (
    <div
      className={cn(
        styles.loaderWrapper,
        {
          [styles.overlayWrapper]: overlay,
        },
        className
      )}
    >
      <LogoLoader size={72} />
      <p className={styles.caption}>Загрузка данных...</p>
    </div>
  );
};
