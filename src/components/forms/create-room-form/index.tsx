import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { notificationManager } from '@/components/shared/toast/utils';
import { createRoom } from '@/services/firebase/createRoom';
import { useAppStore } from '@/store/appStore';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';

import styles from './styles.module.css';

type CreateRoomFormValues = {
  name: string;
  description: string;
};

export const CreateRoomForm = () => {
  const { closeTopBottomSheet } = useAppStore();
  const { fetchUserRooms } = useRoomStore();

  const { control, handleSubmit } = useForm<CreateRoomFormValues>({
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const { user, setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (data: CreateRoomFormValues) => {
    if (!user) return;
    setIsLoading(true);

    try {
      const roomId = await createRoom({
        userId: user.id,
        ...data,
      });

      setUser({ ...user, rooms: [...(user?.rooms || []), roomId] });
      await fetchUserRooms(user.id, { force: true, silent: true });
      closeTopBottomSheet();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка при создании комнаты';
      notificationManager.add(
        {
          title: message,
          type: 'error',
        },
        { timeout: 2000 }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.formWrapper}>
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
          />
        )}
      />

      <Button type="submit" isDisabled={isLoading}>
        {isLoading ? 'Создание...' : 'Создать комнату'}
      </Button>
    </form>
  );
};
