import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { CreateRoomForm } from '@/components/forms/create-room-form';
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

  const handleAddTransaction = (roomId: string) => {
    console.log('Добавить транзакцию для комнаты:', roomId);
  };

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

    await sendJoinRoomRequest(roomId, user);

    setRoomId('');
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.connectRoom}>
        <Input
          onChange={(e) => setRoomId(e.target.value)}
          value={roomId}
          placeholder="Введите id комнаты"
        />
        <Button onClick={handleConnectToRoom}>
          <ArrowRightIcon />
        </Button>
      </div>

      <h1 className={styles.title}>Мои комнаты</h1>

      <BottomSheet
        triggerComponent={<div className={styles.create}>Создать комнату</div>}
        id="create-room"
      >
        <CreateRoomForm />
      </BottomSheet>

      <div className={styles.roomsGrid}>
        {rooms.map((room) => (
          <div key={room.id} className={styles.roomCard} onClick={() => handleToRoom(room.id)}>
            <div className={styles.roomHeader}>
              <h2 className={styles.roomName}>{room.name}</h2>
            </div>
            <p className={styles.roomDescription}>{room.description}</p>

            <div className={styles.actions}>
              <Button
                className={styles.transactionButton}
                onClick={() => handleAddTransaction(room.id)}
              >
                Добавить транзакцию
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
