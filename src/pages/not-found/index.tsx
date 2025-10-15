import { LinkButton } from '@/components/shared/link-button';
import { ROUTE_PATHS } from '@/constants/route-path';
import { useUserStore } from '@/store/userStore';

import styles from './styles.module.css';

import NotFoundImage from '/not-found.png';

export const NotFoundPage = () => {
  const { user } = useUserStore();

  return (
    <div className={styles.wrapper}>
      <div className={styles.blockWrapper}>
        <img src={NotFoundImage} alt="Not found" width={200} height={200} />
        Страница не найдена
        <LinkButton href={user?.id ? ROUTE_PATHS.main : ROUTE_PATHS.auth} className={styles.link}>
          {user?.id ? 'Вернуться на главную' : 'Страница авторизации'}
        </LinkButton>
      </div>
    </div>
  );
};
