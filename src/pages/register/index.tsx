import { useNavigate } from 'react-router';

import { RegisterForm } from '@/components/forms/register-form';
import { notificationManager } from '@/components/shared/toast/utils';
import { ROUTE_PATHS } from '@/constants/route-path';
import { registerUser } from '@/services/firebase/registerUser';
import { useUserStore } from '@/store/userStore';

import styles from './styles.module.css';

export const RegisterPage = () => {
  const navigate = useNavigate();

  const { user } = useUserStore();

  if (user?.id) {
    navigate(ROUTE_PATHS.main);
  }

  const handleRegisterUser = async (data: { login: string; email: string; password: string }) => {
    try {
      const user = await registerUser(data);

      navigate(ROUTE_PATHS.auth);
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
        <RegisterForm onSubmit={handleRegisterUser} />
      </div>
    </div>
  );
};
