import { useMemo } from 'react';
import cn from 'classnames';

import { TransactionForm } from '@/components/forms/transaction-form';
import { BottomSheet } from '@/components/shared/bottom-sheet';
import { notificationManager } from '@/components/shared/toast/utils';
import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { useRoomAccess } from '@/hooks/useRoomAccess';
import { useAppStore } from '@/store/appStore';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';
import { TransactionFormValues, TransactionProps } from '@/types/transaction';

import styles from './styles.module.css';

type Props = {
  transaction: TransactionProps;
  onClick?: () => void;
};

const TransactionCardItem = ({ transaction, onClick }: Props) => {
  return (
    <li
      key={transaction.transactionId}
      className={styles.transactionItem}
      onClick={onClick}
      style={{ border: `1px solid ${transaction.category.color}` }}
    >
      <span style={{ color: `${transaction.category.color}` }}>{transaction.category.name}</span>
      <span
        className={cn(styles.transactionType, {
          [styles.income]: transaction.type === TRANSACTION_TYPE.INCOME,
          [styles.expense]: transaction.type === TRANSACTION_TYPE.EXPENSE,
        })}
      >
        {transaction.type === TRANSACTION_TYPE.INCOME ? '+' : '-'}
        {transaction.amount}
      </span>
    </li>
  );
};

export const TransactionCard = ({ transaction }: Props) => {
  const { user } = useUserStore();
  const { closeTopBottomSheet } = useAppStore();
  const { room, updateTransaction } = useRoomStore();
  const { canModifyTransaction } = useRoomAccess();

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

  const handleClick = () => {
    notificationManager.add(
      {
        title: 'Нельзя изменить чужую запись',
        type: 'error',
      },
      { timeout: 1500 }
    );
  };

  const filterCategories = useMemo(
    () => room?.categories?.filter((category) => category.type === transaction.type),
    [room?.categories, transaction.type]
  );

  if (user?.id === transaction.userId && canModifyTransaction(transaction)) {
    return (
      <BottomSheet
        id={`update-transactions-${transaction.transactionId}`}
        triggerComponent={<TransactionCardItem transaction={transaction} />}
      >
        <TransactionForm
          values={transaction}
          type={transaction.type}
          onSubmit={(data) => handleTransitionSubmit(data, transaction.type)}
          categories={filterCategories}
        />
      </BottomSheet>
    );
  }

  return <TransactionCardItem transaction={transaction} onClick={handleClick} />;
};
