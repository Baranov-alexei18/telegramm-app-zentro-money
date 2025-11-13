import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import cn from 'classnames';

import { TransactionForm } from '@/components/forms/transaction-form';
import { ArrowDownIcon } from '@/components/icons/arrow-down-icon';
import { ArrowUpIcon } from '@/components/icons/arrow-up-icon';
import { BottomSheet } from '@/components/shared/bottom-sheet';
import { Button } from '@/components/shared/button';
import { ROUTE_PATHS } from '@/constants/route-path';
import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { getUserRooms } from '@/services/firebase/getUserRooms';
import { useAppStore } from '@/store/appStore';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';
import { TransactionFormValues, TransactionProps } from '@/types/transaction';
import { convertToDate } from '@/utils/convertToDate';

import styles from './styles.module.css';

export const TransactionsPage = () => {
  const { closeTopBottomSheet } = useAppStore();
  const { user } = useUserStore();
  const { room, setRoom, fetchTransactions, deleteTransaction, updateTransaction } = useRoomStore();

  const [viewType, setViewType] = useState<TRANSACTION_TYPE>(TRANSACTION_TYPE.EXPENSE);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const params = useParams<{ id: string }>();

  const navigate = useNavigate();

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

  const handleToggleCategory = (categoryId: string) => {
    setExpandedCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  const handleGoToRoom = (roomId: string) => {
    navigate(`${ROUTE_PATHS.room}/${roomId}`);
  };

  const handleTransitionSubmit = async (data: TransactionFormValues, type: TRANSACTION_TYPE) => {
    if (!user || !room) return;

    const transactionData = {
      type: type,
      ...data,
    } as TransactionProps;

    try {
      await updateTransaction(transactionData);
    } catch (e) {
      alert(e);
    }

    closeTopBottomSheet();
  };

  const filterCategories = useMemo(
    () => room?.categories?.filter((category) => category.type === viewType),
    [room?.categories, viewType]
  );
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Транзакции</h1>

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

      {room?.categories
        .filter((cat) => cat.type === viewType)
        .map((category) => {
          const isOpen = expandedCategory === category.id;
          const transactions = room.transactions?.filter(
            (t) => t.category.id === category.id && t.type === viewType
          );

          if (!transactions?.length) {
            return null;
          }

          const categoryTotal = transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);

          return (
            <div key={category.id} className={styles.categoryCard}>
              <div
                className={styles.categoryHeader}
                onClick={() => handleToggleCategory(category.id)}
                style={{
                  borderBottom: isOpen ? `1px solid ${category.color}` : 'none',
                }}
              >
                <div className={styles.categoryInfo}>
                  <div
                    className={styles.categoryColor}
                    style={{
                      backgroundColor: category.color,
                    }}
                  />
                  <span className={styles.categoryName}>{category.name}</span>
                  <span className={styles.categorySum}>
                    {viewType === TRANSACTION_TYPE.EXPENSE ? '-' : '+'}
                    {categoryTotal} у.е.
                  </span>
                </div>
                <span className={styles.arrow}>{isOpen ? <ArrowUpIcon /> : <ArrowDownIcon />}</span>
              </div>

              {isOpen && (
                <div className={styles.transactionsList}>
                  {transactions.map((t) => (
                    <div key={t.category.id} className={styles.transactionItem}>
                      <div className={styles.transactionInfo}>
                        <span className={styles.transactionName}>{t.description}</span>
                        <span className={styles.transactionDate}>
                          {t.date?.seconds
                            ? convertToDate(t.date).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })
                            : 'даты нет'}
                        </span>
                      </div>
                      <span
                        className={cn(
                          styles.transactionAmount,
                          t.type === TRANSACTION_TYPE.EXPENSE ? styles.expense : styles.income
                        )}
                      >
                        {t.type === TRANSACTION_TYPE.EXPENSE ? '-' : '+'}
                        {t.amount} у.е.
                      </span>

                      <div className={styles.wrapperActions}>
                        <BottomSheet
                          id={`update-transactions-${t.transactionId}`}
                          triggerComponent={<div className={styles.sheetContent}>✏️</div>}
                        >
                          <TransactionForm
                            values={t}
                            type={viewType}
                            onSubmit={(data) => handleTransitionSubmit(data, viewType)}
                            categories={filterCategories}
                          />
                        </BottomSheet>
                        <Button
                          onClick={() => deleteTransaction(t.transactionId!)}
                          className={styles.menuItemDelete}
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
};
