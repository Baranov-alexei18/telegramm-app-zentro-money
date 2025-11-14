import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { AuthForm } from '@/components/forms/auth-form';
import { notificationManager } from '@/components/shared/toast/utils';
import { ROUTE_PATHS } from '@/constants/route-path';
import { getDataUserById } from '@/services/firebase/getDataUserById';
import { loginUser } from '@/services/firebase/loginUser';
import { useUserStore } from '@/store/userStore';

import styles from './styles.module.css';

export const AuthPage = () => {
  const navigate = useNavigate();

  const { user } = useUserStore();

  useEffect(() => {
    if (user?.id) {
      navigate(ROUTE_PATHS.main);
    }
  }, [navigate, user]);

  const handleAuth = async (data: { login: string; password: string }) => {
    try {
      const user = await loginUser(data);

      const userData = await getDataUserById(user.uid);

      useUserStore.setState({ user: userData, error: null });

      navigate(ROUTE_PATHS.main);
    } catch (err: any) {
      notificationManager.add(
        {
          title: err.message,
          type: 'error',
        },
        { timeout: 2000 }
      );
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.wrapperContent}>
        <AuthForm onSubmit={handleAuth} />
      </div>
    </div>
  );
};
