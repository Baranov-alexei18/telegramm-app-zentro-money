import { Fragment, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { AvatarCircle } from '@/components/avatar-circle';
import { BackButton } from '@/components/back-button';
import { Header } from '@/components/header';
import { Button as AppButton } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { useUserStore } from '@/store/userStore';
import { UpdateUserType } from '@/types/user';

import styles from './styles.module.css';

export const ProfilePage = () => {
  const { user, updateDataUser } = useUserStore();

  const [isLoading, setIsLoading] = useState(false);

  const valuesForm = {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  };

  const { control, handleSubmit } = useForm<UpdateUserType>({
    defaultValues: valuesForm,
  });

  const handleFormSubmit = async (data: UpdateUserType) => {
    try {
      setIsLoading(true);

      updateDataUser(data);
    } catch (error) {
      console.error('Ошибка при отправке формы:', error);
      alert('Произошла ошибка ❌');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Fragment>
      <Header>
        <BackButton />
      </Header>
      <div className={styles.wrapper}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.formWrapper}>
          <AvatarCircle id={user?.id || ''} height={60} width={60} />

          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <Input
                value={field.value}
                onChange={field.onChange}
                placeholder="Имя"
                disabled={isLoading}
              />
            )}
          />
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <Input
                value={field.value}
                onChange={field.onChange}
                placeholder="Фамилия"
                disabled={isLoading}
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...control.register('email', {
                  required: 'Email обязателен',
                  pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                })}
                value={field.value}
                onChange={field.onChange}
                placeholder="Email"
                disabled={isLoading}
              />
            )}
          />

          <AppButton type="submit" isDisabled={isLoading} className={styles.button}>
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </AppButton>
        </form>
      </div>
    </Fragment>
  );
};
