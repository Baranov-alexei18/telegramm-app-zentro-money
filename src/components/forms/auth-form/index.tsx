import { FormEvent, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

import Logo from '@/assets/images/logo.png';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { LinkButton } from '@/components/shared/link-button';
import { GoogleWidget } from '@/components/widgets/google-widget';
import { ROUTE_PATHS } from '@/constants/route-path';

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

  // const handleTelegramAuth = async (user: UserType) => {
  //   console.log('Данные из Telegram:', user);
  // };

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
      <GoogleWidget />
      {/* Todo: понять почему не пришло письмо для авторизации через telegramm */}
      {/* <TelegramWidget botName="Zentro_Money_Bot" onAuth={handleTelegramAuth} /> */}
      <div className={styles.footer}>
        <span>Нет аккаунта?</span>
        <LinkButton href={ROUTE_PATHS.register} className={styles.footerLink}>
          Зарегистрироваться
        </LinkButton>
      </div>
    </form>
  );
};
