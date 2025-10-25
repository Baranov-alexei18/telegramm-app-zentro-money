import { useEffect, useState } from 'react';

import { CreateRoomForm } from '@/components/forms/create-room-form';
import { BottonSheet } from '@/components/shared/botton-sheet';
import { Button } from '@/components/shared/button';
import { getUserRooms } from '@/services/firebase/getUserRooms';
import { useUserStore } from '@/store/userStore';

import styles from './styles.module.css';

export type RoomType = {
  id: string;
  name: string;
  description: string;
};

export const RoomsPage = () => {
  const { user } = useUserStore();
  const [rooms, setRooms] = useState<RoomType[]>([]);

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

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Мои комнаты</h1>

      <BottonSheet triggerComponent={<div className={styles.create}>Создать комнату</div>}>
        <CreateRoomForm />
      </BottonSheet>

      <div className={styles.roomsGrid}>
        {rooms.map((room) => (
          <div key={room.id} className={styles.roomCard}>
            <div className={styles.roomHeader}>
              <h2 className={styles.roomName}>{room.name}</h2>
            </div>
            <p className={styles.roomDescription}>{room.description}</p>

            <div className={styles.actions}>
              <Button
                className={styles.transactionButton}
                onClick={() => handleAddTransaction(room.id)}
              >
                + Добавить транзакцию
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
