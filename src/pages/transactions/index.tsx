import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import cn from 'classnames';

import { PeriodDateNavigator } from '@/components/period-date-navigator';
import { PeriodPicker } from '@/components/period-picker';
import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { getUserRooms } from '@/services/firebase/getUserRooms';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';

import { CategoryList } from './category-list';

import styles from './styles.module.css';

export const TransactionsPage = () => {
  const { user } = useUserStore();
  const { room, setRoom, fetchTransactions } = useRoomStore();

  const [viewType, setViewType] = useState<TRANSACTION_TYPE>(TRANSACTION_TYPE.EXPENSE);
  const params = useParams<{ id: string }>();

  useEffect(() => {
    const fetchRoom = async () => {
      if (!user || room?.roomId === params.id) return;

      try {
        const rooms = await getUserRooms(user.id);

        const currentRoom = rooms.find((r) => r.roomId === params.id);

        if (!currentRoom?.roomId) {
          return;
        }

        fetchTransactions(currentRoom?.roomId);

        setRoom(currentRoom || null);
      } catch (e) {
        console.error(e);
      }
    };

    fetchRoom();
  }, [user, setRoom, room?.roomId, params.id, fetchTransactions]);

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Транзакции</h1>
      <PeriodPicker />
      <PeriodDateNavigator />
      <div className={styles.tabs}>
        <button
          className={cn(styles.tab, viewType === TRANSACTION_TYPE.EXPENSE && styles.activeTab)}
          onClick={() => setViewType(TRANSACTION_TYPE.EXPENSE)}
        >
          Расходы
        </button>
        <button
          className={cn(styles.tab, viewType === TRANSACTION_TYPE.INCOME && styles.activeTab)}
          onClick={() => setViewType(TRANSACTION_TYPE.INCOME)}
        >
          Доходы
        </button>
      </div>
      <CategoryList viewType={viewType} />
    </div>
  );
};
