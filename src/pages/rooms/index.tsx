import { Fragment, SetStateAction, useEffect, useState } from 'react';
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
import { getUserRooms } from '@/services/firebase/getUserRooms';
import { sendJoinRoomRequest } from '@/services/firebase/sendJoinRoomRequest';
import { useUserStore } from '@/store/userStore';
import { RoomType } from '@/types/room';

import styles from './styles.module.css';

export const RoomsPage = () => {
  const { user } = useUserStore();
  const [roomId, setRoomId] = useState('');
  const [rooms, setRooms] = useState<RoomType[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const getRoomsData = async () => {
      if (!user) {
        return;
      }
      try {
        const data = await getUserRooms(user?.id);

        setRooms(data);
      } catch (e) {
        console.error(e);
      }
    };

    getRoomsData();
  }, [user]);

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

  const changeRoomId = (e: { target: { value: SetStateAction<string> } }) =>
    setRoomId(e.target.value);
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
          <Input onChange={changeRoomId} value={roomId} placeholder="Введите id комнаты" />
          <Button onClick={handleConnectToRoom}>
            <ArrowRightIcon />
          </Button>
        </div>

        <div className={styles.roomsGrid}>
          {rooms.map((room) => (
            <div
              key={room.roomId}
              className={styles.roomCard}
              onClick={() => handleToRoom(room.roomId)}
            >
              <div className={styles.roomHeader}>
                <h2 className={styles.roomName}>
                  {room.name} (👥{Object.keys(room.members || {}).length} )
                </h2>
              </div>
              {room.description && <p className={styles.roomDescription}>{room.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </Fragment>
  );
};
