import { useState } from 'react';

import { BottonSheet } from '@/components/shared/botton-sheet';
import { Button } from '@/components/shared/button';

import styles from './styles.module.css';

type Room = {
  id: string;
  name: string;
  description: string;
  balance: number;
};

export const RoomsPage = () => {
  const [rooms, setRooms] = useState<Room[]>([
    { id: '1', name: 'Семейный бюджет', description: 'Финансы семьи Будниковых', balance: 1530 },
    { id: '2', name: 'Друзья', description: 'Совместные расходы на отдых', balance: -320 },
    { id: '2', name: 'Друзья', description: 'Совместные расходы на отдых', balance: -3320 },
  ]);

  const handleCreateRoom = () => {
    console.log('Создание новой комнаты');
  };

  const handleAddTransaction = (roomId: string) => {
    console.log('Добавить транзакцию для комнаты:', roomId);
  };

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Мои комнаты</h1>
      <Button className={styles.createButton} onClick={handleCreateRoom}>
        Создать комнату
      </Button>

      <BottonSheet triggerComponent={<div>1234324</div>}>
        <div>1234324</div> <div>1234324</div> <div>1234324</div> <div>1234324</div>{' '}
        <div>1234324</div> <div>1234324</div> <div>1234324</div> <div>1234324</div>{' '}
        <div>1234324</div> <div>1234324</div> <div>1234324</div> <div>1234324</div>{' '}
        <div>1234324</div> <div>1234324</div> <div>1234324</div> <div>1234324</div>{' '}
        <div>1234324</div> <div>1234324</div> <div>1234324</div> <div>1234324</div>{' '}
      </BottonSheet>

      <div className={styles.roomsGrid}>
        {rooms.map((room) => (
          <div key={room.id} className={styles.roomCard}>
            <div className={styles.roomHeader}>
              <h2 className={styles.roomName}>{room.name}</h2>
              <span
                className={`${styles.balance} ${
                  room.balance >= 0 ? styles.positive : styles.negative
                }`}
              >
                {room.balance >= 0 ? '+' : ''}
                {room.balance} ₽
              </span>
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
