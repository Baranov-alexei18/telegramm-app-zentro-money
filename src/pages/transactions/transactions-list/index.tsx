import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import cn from 'classnames';

import { TransactionForm } from '@/components/forms/transaction-form';
import { BottomSheet } from '@/components/shared/bottom-sheet';
import { Button } from '@/components/shared/button';
import { notificationManager } from '@/components/shared/toast/utils';
import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { useRoomAccess } from '@/hooks/useRoomAccess';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';
import { SyncStatus, TransactionFormValues, TransactionProps } from '@/types/transaction';
import { convertToDate } from '@/utils/convertToDate';
import { getSortedTransactionsByDate } from '@/utils/get-sorted-transactions-by-date';

import styles from './styles.module.css';

type Props = {
  transactions: TransactionProps[];
  viewType: TRANSACTION_TYPE;
};

export const TransactionsList = ({ transactions, viewType }: Props) => {
  const { canModifyTransaction, canDeleteTransaction } = useRoomAccess();
  const { user } = useUserStore();
  const { room, deleteTransaction, updateTransaction } = useRoomStore();

  const [loading, setLoading] = useState(false);

  const sortedTransactions = useMemo(() => {
    return getSortedTransactionsByDate(transactions);
  }, [transactions]);

  const handleTransitionSubmit = async (
    targetTx: TransactionProps,
    data: TransactionFormValues,
    type: TRANSACTION_TYPE
  ) => {
    if (!user || !room) return;

    const transactionData: TransactionProps = {
      ...targetTx,
      ...data,
      type,
    };

    try {
      await updateTransaction(transactionData);
    } catch {
      notificationManager.add(
        { title: 'Не удалось обновить транзакцию', type: 'error' },
        { timeout: 1500 }
      );
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      setLoading(true);

      await deleteTransaction(id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = useMemo(
    () => room?.categories?.filter((category) => category.type === viewType),
    [room?.categories, viewType]
  );

  return (
    <div className={styles.transactionsList}>
      {sortedTransactions.map((t) => {
        return (
          <div key={t.transactionId} className={styles.transactionItem}>
            <div className={styles.transactionInfoWrapper}>
              <div className={styles.transactionInfo}>
                <span className={styles.transactionName}>{t.description}</span>
                <span className={styles.transactionDate}>
                  {t.date?.seconds
                    ? convertToDate(t.date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
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
                {t.amount}
                {t.syncStatus === SyncStatus.PENDING && (
                  <Icon
                    icon="tdesign:time"
                    height={16}
                    width={16}
                    color="grey"
                    className={styles.animateBounceShort}
                  />
                )}
              </span>
            </div>

            <div className={styles.wrapperActions}>
              {canModifyTransaction(t) && (
                <BottomSheet
                  id={`update-transactions-${t.transactionId}`}
                  triggerComponent={<div className={styles.sheetContent}>✏️</div>}
                >
                  <TransactionForm
                    values={t}
                    type={viewType}
                    onSubmit={(data) => handleTransitionSubmit(t, data, viewType)}
                    categories={filterCategories}
                  />
                </BottomSheet>
              )}
              {canDeleteTransaction(t) && (
                <Button
                  onClick={() => handleDeleteTransaction(t.transactionId!)}
                  className={styles.menuItemDelete}
                  loading={loading}
                >
                  🗑️
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
