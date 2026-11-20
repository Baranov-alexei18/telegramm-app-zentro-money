import { ChangeEvent, Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { BackButton } from '@/components/back-button';
import { CreateRoomForm } from '@/components/forms/create-room-form';
import { Header } from '@/components/header';
import { ArrowRightIcon } from '@/components/icons/arrow-right-icon';
import { BottomSheet } from '@/components/shared/bottom-sheet';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { notificationManager } from '@/components/shared/toast/utils';
import { ROUTE_PATHS } from '@/constants/route-path';
import { sendJoinRoomRequest } from '@/services/firebase/sendJoinRoomRequest';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';

import styles from './styles.module.css';

export const RoomsPage = () => {
  const { user } = useUserStore();
  const { userRooms, hasLoadedUserRooms, loadedRoomsUserId, fetchUserRooms } = useRoomStore();
  const [roomId, setRoomId] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) return;
    if (hasLoadedUserRooms && loadedRoomsUserId === user.id) return;

    fetchUserRooms(user.id).catch((error) => {
      console.error(error);
    });
  }, [fetchUserRooms, hasLoadedUserRooms, loadedRoomsUserId, user?.id]);

  const handleToRoom = (id: string) => {
    navigate(`${ROUTE_PATHS.room}/${id}`);
  };

  const handleConnectToRoom = async () => {
    if (!roomId.trim() || !user) {
      notificationManager.add(
        {
          title: 'Идентификатор комнаты не введен',
          type: 'error',
        },
        { timeout: 1000 }
      );

      return;
    }

    const data = await sendJoinRoomRequest(roomId, user);

    if (data?.success) {
      notificationManager.add(
        {
          title: 'Заявка в комнату отправлена, ожидайте...',
          type: 'ok',
        },
        { timeout: 2000 }
      );

      setRoomId('');
    }
  };

  const handleRoomIdChange = (e: ChangeEvent<HTMLInputElement>) => setRoomId(e.target.value);

  return (
    <Fragment>
      <Header className={styles.headerWrapper}>
        <BackButton />

        <h2 className={styles.title}>Мои комнаты</h2>

        <BottomSheet
          triggerComponent={<div className={styles.create}>Создать комнату</div>}
          id="create-room"
        >
          <CreateRoomForm />
        </BottomSheet>
      </Header>
      <div className={styles.wrapper}>
        <div className={styles.connectRoom}>
          <Input onChange={handleRoomIdChange} value={roomId} placeholder="Введите id комнаты" />
          <Button onClick={handleConnectToRoom}>
            <ArrowRightIcon />
          </Button>
        </div>

        <div className={styles.roomsGrid}>
          {userRooms.map((room) => (
            <div
              key={room.roomId}
              className={styles.roomCard}
              onClick={() => handleToRoom(room.roomId)}
            >
              <div className={styles.roomHeader}>
                <h2 className={styles.roomName}>{room.name}</h2>
              </div>
              {room.description && <p className={styles.roomDescription}>{room.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </Fragment>
  );
};
