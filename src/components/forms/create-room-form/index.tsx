import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { notificationManager } from '@/components/shared/toast/utils';
import { createRoom } from '@/services/firebase/createRoom';
import { useAppStore } from '@/store/appStore';
import { useUserStore } from '@/store/userStore';

import styles from './styles.module.css';

type CreateRoomFormValues = {
  name: string;
  description: string;
};

export const CreateRoomForm = () => {
  const { closeTopBottomSheet } = useAppStore();

  const { control, handleSubmit } = useForm<CreateRoomFormValues>({
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const { user, setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: CreateRoomFormValues) => {
    if (!user) return;
    setIsLoading(true);

    try {
      const roomId = await createRoom({
        userId: user.id,
        ...data,
      });

      setUser({ ...user, rooms: [...(user?.rooms || []), roomId] });
      closeTopBottomSheet();
    } catch (error: any) {
      notificationManager.add(
        {
          title: error.message,
          type: 'error',
        },
        { timeout: 2000 }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.formWrapper}>
      <Controller
        name="name"
        control={control}
        rules={{
          required: 'Введите название комнаты',
          minLength: { value: 3, message: 'Минимум 3 символа' },
        }}
        render={({ field, fieldState }) => (
          <Input
            value={field.value}
            onChange={field.onChange}
            placeholder="Название комнаты"
            error={fieldState.error?.message}
            disabled={isLoading}
          />
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field, fieldState }) => (
          <Input
            value={field.value}
            onChange={field.onChange}
            placeholder="Описание"
            error={fieldState.error?.message}
            disabled={isLoading}
            style={{ width: '100%' }}
          />
        )}
      />

      <Button type="submit" isDisabled={isLoading}>
        {isLoading ? 'Создание...' : 'Создать комнату'}
      </Button>
    </form>
  );
};
