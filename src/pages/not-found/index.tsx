import styles from './styles.module.css';

import NotFoundImage from '/not-found.png';

export const NotFoundPage = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.blockWrapper}>
        <img src={NotFoundImage} alt="Not found" width={300} height={300} />
        Страница не найдена
        {/* <NavLink to={userId ? ROUTE_PATHS.home : ROUTE_PATHS.auth} className={styles.link}>
          {userId ? 'Вернуться на главную' : 'Страница авторизации'}
        </NavLink> */}
      </div>
    </div>
  );
};
