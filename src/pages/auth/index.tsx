import { useNavigate } from 'react-router';

import { AuthForm } from '@/components/forms/auth-form';
import { ROUTE_PATHS } from '@/constants/route-path';
import { getDataUserById } from '@/services/firebase/getDataUserById';
import { loginUser } from '@/services/firebase/loginUser';
import { useUserStore } from '@/store/userStore';

import styles from './styles.module.css';

export const AuthPage = () => {
  const navigate = useNavigate();

  const { user } = useUserStore();

  if (user?.id) {
    navigate(ROUTE_PATHS.main);
  }

  const handleAuth = async (data: { login: string; password: string }) => {
    try {
      const user = await loginUser(data);

      const userData = await getDataUserById(user.uid);

      useUserStore.setState({ user: userData, error: null });

      navigate(ROUTE_PATHS.main);
    } catch (err: any) {
      alert(err.message);
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
