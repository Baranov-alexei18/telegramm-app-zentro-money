import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { TransactionForm } from '@/components/forms/transaction-form';
import { BottomSheet } from '@/components/shared/bottom-sheet';
import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { createTransaction } from '@/services/firebase/createTransaction';
import { getUserRooms } from '@/services/firebase/getUserRooms';
import { useAppStore } from '@/store/appStore';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';
import { RoomType } from '@/types/room';
import { TransactionFormValues } from '@/types/transaction';

import styles from './styles.module.css';

export const RoomPage = () => {
  const { user } = useUserStore();
  const { room, setRoom, fetchTransactions, addTransaction } = useRoomStore();
  const { closeTopBottomSheet } = useAppStore();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchRoom = async () => {
      if (!user) return;
      try {
        const rooms = await getUserRooms(user.id);

        const currentRoom = rooms.find((r) => r.id === id);

        if (!currentRoom?.id) {
          return;
        }

        fetchTransactions(currentRoom?.id);

        setRoom(currentRoom || null);
      } catch (e) {
        console.error(e);
      }
    };

    fetchRoom();
  }, [user, id, fetchTransactions, setRoom]);

  if (!room) {
    return <div className={styles.loader}>Загрузка...</div>;
  }

  const handleTransitionSubmit = async (data: TransactionFormValues, type: TRANSACTION_TYPE) => {
    if (!user || !room) return;

    const transactionData = {
      userId: user.id,
      roomId: room.id,
      type: type,
      ...data,
    };

    try {
      await addTransaction(room.id, transactionData);
    } catch (e) {
      alert(e);
    }

    closeTopBottomSheet();
  };

  const lastTransactions = room.transactions?.slice(-5).reverse() || [];

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>{room.name}</h1>
        <p className={styles.description}>{room.description}</p>
      </header>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Приход</h2>
          <BottomSheet
            id="add-income"
            triggerComponent={
              <div className={styles.sheetContent}>
                <h3>Добавить приход</h3>
              </div>
            }
          >
            <TransactionForm
              type={TRANSACTION_TYPE.INCOME}
              onSubmit={(data) => handleTransitionSubmit(data, TRANSACTION_TYPE.INCOME)}
              categories={room?.categories?.filter(
                (category) => category.type === TRANSACTION_TYPE.INCOME
              )}
            />
          </BottomSheet>
        </div>
        <p className={styles.cardText}>Добавьте запись о поступлении денег</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Расход</h2>
          <BottomSheet
            id="add-expense"
            triggerComponent={
              <div className={styles.sheetContent}>
                <h3>Добавить расход</h3>
              </div>
            }
          >
            <TransactionForm
              type={TRANSACTION_TYPE.EXPENSE}
              onSubmit={(data) => handleTransitionSubmit(data, TRANSACTION_TYPE.EXPENSE)}
              categories={room?.categories?.filter(
                (category) => category.type === TRANSACTION_TYPE.EXPENSE
              )}
            />
          </BottomSheet>
        </div>
        <p className={styles.cardText}>Добавьте запись о трате</p>
      </div>

      <div className={styles.transactions}>
        <h3 className={styles.subTitle}>Последние транзакции</h3>
        {lastTransactions.length ? (
          <ul className={styles.transactionsList}>
            {lastTransactions.map((t) => (
              <li key={t.transactionId} className={styles.transactionItem}>
                <span
                  className={`${styles.transactionType} ${
                    t.type === TRANSACTION_TYPE.INCOME ? styles.income : styles.expense
                  }`}
                >
                  {t.type === TRANSACTION_TYPE.INCOME ? '+' : '-'}${t.amount}
                </span>
                <span>{t.description}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>Транзакций пока нет</p>
        )}
      </div>
    </div>
  );
};
