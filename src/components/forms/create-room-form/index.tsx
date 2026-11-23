import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { RoomCoverPicker } from '@/components/room-cover-picker';
import { RoomIconColorPicker } from '@/components/room-icon-color-picker';
import { RoomIconPicker } from '@/components/room-icon-picker';
import { RoomKindPicker } from '@/components/room-kind-picker';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { notificationManager } from '@/components/shared/toast/utils';
import {
  DEFAULT_ROOM_COVER_GRADIENT_ID,
  ROOM_COVER_GRADIENTS,
} from '@/constants/room-cover-gradients';
import { DEFAULT_ROOM_ICON_COLOR_ID, DEFAULT_ROOM_ICON_ID } from '@/constants/room-icons';
import { RoomKind } from '@/constants/room-kind';
import { getRoomCoverGradientById } from '@/lib/resolve-room-cover-gradient';
import { createRoom } from '@/services/firebase/createRoom';
import { useAppStore } from '@/store/appStore';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';

import styles from './styles.module.css';

type CreateRoomFormValues = {
  name: string;
  description: string;
  coverGradientId: string;
  iconId: string;
  iconColorId: string;
  kind: RoomKind;
};

export const CreateRoomForm = () => {
  const { closeTopBottomSheet } = useAppStore();
  const { fetchUserRooms } = useRoomStore();

  const { control, handleSubmit } = useForm<CreateRoomFormValues>({
    defaultValues: {
      name: '',
      description: '',
      coverGradientId: DEFAULT_ROOM_COVER_GRADIENT_ID,
      iconId: DEFAULT_ROOM_ICON_ID,
      iconColorId: DEFAULT_ROOM_ICON_COLOR_ID,
      kind: RoomKind.SHARED_EXPENSES,
    },
  });

  const coverGradientId = useWatch({ control, name: 'coverGradientId' });
  const coverCss =
    getRoomCoverGradientById(coverGradientId)?.css ??
    getRoomCoverGradientById(DEFAULT_ROOM_COVER_GRADIENT_ID)?.css ??
    ROOM_COVER_GRADIENTS[0]?.css ??
    '';

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

      <Controller
        name="kind"
        control={control}
        render={({ field }) => (
          <RoomKindPicker value={field.value} onChange={field.onChange} disabled={isLoading} />
        )}
      />

      <Controller
        name="iconId"
        control={control}
        render={({ field }) => (
          <RoomIconPicker value={field.value} onChange={field.onChange} disabled={isLoading} />
        )}
      />

      <Controller
        name="iconColorId"
        control={control}
        render={({ field }) => (
          <RoomIconColorPicker
            value={field.value}
            coverCss={coverCss}
            onChange={field.onChange}
            disabled={isLoading}
          />
        )}
      />

      <Controller
        name="coverGradientId"
        control={control}
        render={({ field }) => (
          <RoomCoverPicker value={field.value} onChange={field.onChange} disabled={isLoading} />
        )}
      />

      <Button type="submit" isDisabled={isLoading}>
        {isLoading ? 'Создание...' : 'Создать комнату'}
      </Button>
    </form>
  );
};
