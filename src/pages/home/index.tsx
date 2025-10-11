import { useUserStore } from '@/store/userStore';

import styles from './styles.module.css';

export const HomePage = () => {
  const { user } = useUserStore();

  return <div className={styles.wrapper}>HomePage {user?.username}</div>;
};
