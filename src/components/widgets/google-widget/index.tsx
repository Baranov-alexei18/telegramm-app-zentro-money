import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

import { Button } from '@/components/shared/button';
import { auth } from '@/services/firebase/config';

import styles from './styles.module.css';

export const GoogleWidget = () => {
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Ошибка Google Auth:', error);
    }
  };

  return (
    <Button type="button" onClick={handleGoogleSignIn} className={styles.googleButton}>
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google"
        width="18"
        style={{ marginRight: '8px' }}
      />
      Войти через Google
    </Button>
  );
};
