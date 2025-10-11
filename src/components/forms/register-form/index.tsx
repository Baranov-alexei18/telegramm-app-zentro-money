'use client';

import { ChangeEvent, FormEvent, useState } from 'react';

import Logo from '@/assets/images/logo.png';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { LinkButton } from '@/components/shared/link-button';

import styles from './styles.module.css';

export type RegisterFormData = {
  login: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type RegisterFormProps = {
  onSubmit: (data: { login: string; email: string; password: string }) => void;
};

export const RegisterForm = ({ onSubmit }: RegisterFormProps) => {
  const [form, setForm] = useState<RegisterFormData>({
    login: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');

  const handleChange = (field: keyof RegisterFormData) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setError('');
    onSubmit({ login: form.login, email: form.email, password: form.password });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <img src={Logo} alt="Logo" className={styles.logoWrapper} />
      <h2 className={styles.title}>Регистрация</h2>

      <Input label="Логин" value={form.login} onChange={handleChange('login')} />
      <Input label="Email" type="email" value={form.email} onChange={handleChange('email')} />
      <Input
        label="Пароль"
        type="password"
        value={form.password}
        error={error}
        onChange={handleChange('password')}
      />
      <Input
        label="Подтвердите пароль"
        type="password"
        value={form.confirmPassword}
        error={error}
        onChange={handleChange('confirmPassword')}
      />

      <Button type="submit" className={styles.formButton}>
        Зарегистрироваться
      </Button>

      <div className={styles.footer}>
        <span>Уже есть аккаунт?</span>
        <LinkButton href="/auth" className={styles.footerLink}>
          Войти
        </LinkButton>
      </div>
    </form>
  );
};
