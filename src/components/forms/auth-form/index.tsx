import { FormEvent, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

import Logo from '@/assets/images/logo.png';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { LinkButton } from '@/components/shared/link-button';
import { ROUTE_PATHS } from '@/constants/route-path';
import { auth } from '@/services/firebase/config';

import styles from './styles.module.css';

type AuthFormProps = {
  onSubmit: (data: { login: string; password: string }) => void;
};

export const AuthForm = ({ onSubmit }: AuthFormProps) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ login, password });
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Пользователь успешно вошел
      console.log('Google User:', result.user);
      // Здесь можно сделать редирект или вызвать колбэк успешного входа
    } catch (error) {
      console.error('Ошибка Google Auth:', error);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <img src={Logo} alt="Logo" className={styles.logoWrapper} />
      <h2 className={styles.title}>Авторизация</h2>
      <Input
        label="Email"
        value={login}
        onChange={(e) => setLogin(e.target.value)}
        required={true}
      />
      <Input
        label="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required={true}
      />

      <Button type="submit" className={styles.formButton}>
        Войти
      </Button>

      <Button type="button" onClick={handleGoogleSignIn} className={styles.googleButton}>
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google"
          width="18"
          style={{ marginRight: '8px' }}
        />
        Войти через Google
      </Button>

      <div className={styles.footer}>
        <span>Нет аккаунта?</span>
        <LinkButton href={ROUTE_PATHS.register} className={styles.footerLink}>
          Зарегистрироваться
        </LinkButton>
      </div>
    </form>
  );
};
