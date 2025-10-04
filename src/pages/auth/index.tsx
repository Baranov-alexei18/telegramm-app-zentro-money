import styles from './styles.module.css';

export const AuthPage = () => {
  const tg = (window as any).Telegram?.WebApp;
  const user = tg?.initDataUnsafe?.user;

  return (
    <div className={styles.wrapper}>
      <span>AuthPage</span>
      <p>{JSON.stringify(tg, null, 2)}</p>
      <p>{JSON.stringify(user, null, 2)}</p>
      <p>{user?.id}</p>
    </div>
  );
};
