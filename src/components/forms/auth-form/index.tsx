import { FormEvent, useState } from 'react';

import Logo from '@/assets/images/logo.png';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { LinkButton } from '@/components/shared/link-button';
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

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <img src={Logo} alt="Logo" className={styles.logoWrapper} />
      <h2 className={styles.title}>Авторизация</h2>
      <Input label="Email" value={login} onChange={(e) => setLogin(e.target.value)} />
      <Input
        label="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button type="submit" className={styles.formButton}>
        Войти
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
