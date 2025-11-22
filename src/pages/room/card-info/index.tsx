import { useLocation, useNavigate } from 'react-router';

import { TransactionForm } from '@/components/forms/transaction-form';
import { AroundPlusIcon } from '@/components/icons/around-plus-icon';
import { BottomSheet } from '@/components/shared/bottom-sheet';
import { Button } from '@/components/shared/button';
import { ROUTE_PATHS } from '@/constants/route-path';
import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { useAppStore } from '@/store/appStore';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';
import { TransactionFormValues } from '@/types/transaction';
import { formatSmartNumber } from '@/utils/formatSmartNumber';

import { CardInfoMapper } from './constants';
import { isSameDay, isSameMonth, isSameWeek } from './utils';

import styles from './styles.module.css';

type Props = {
  type: TRANSACTION_TYPE;
};

export const CardInfo = ({ type }: Props) => {
  const { user } = useUserStore();
  const { room, addTransaction } = useRoomStore();
  const { closeTopBottomSheet } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();

  const transactions = room?.transactions?.filter((t) => t.type === type) ?? [];

  const now = new Date();

  const dayTotal = transactions
    .filter((t) => isSameDay(new Date(t.date.seconds * 1000), now))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const weekTotal = transactions
    .filter((t) => isSameWeek(new Date(t.date.seconds * 1000), now))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthTotal = transactions
    .filter((t) => isSameMonth(new Date(t.date.seconds * 1000), now))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const handleTransitionSubmit = async (data: TransactionFormValues, type: TRANSACTION_TYPE) => {
    if (!user || !room) return;

    const transactionData = {
      userId: user.id,
      roomId: room.roomId,
      type: type,
      ...data,
    };

    try {
      await addTransaction(room.roomId, transactionData);
    } catch (e) {
      alert(e);
    }

    closeTopBottomSheet();
  };

  const handleGoToTransitionsPage = (type: TRANSACTION_TYPE) => {
    navigate(`${location.pathname}${ROUTE_PATHS.transactions}`, { state: { type } });
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h4>{CardInfoMapper[type].title}</h4>

        <BottomSheet
          id={`add-${type}`}
          triggerComponent={
            <div>
              <AroundPlusIcon />
            </div>
          }
        >
          <TransactionForm
            type={type}
            onSubmit={(data) => handleTransitionSubmit(data, type)}
            categories={room?.categories?.filter((category) => category.type === type)}
          />
        </BottomSheet>
      </div>

      <div className={styles.statsTable}>
        <div className={styles.row}>
          <span>День</span>
          <span>{formatSmartNumber(dayTotal)}</span>
        </div>
        <div className={styles.row}>
          <span>Неделя</span>
          <span>{formatSmartNumber(weekTotal)}</span>
        </div>
        <div className={styles.row}>
          <span>Месяц</span>
          <span>{formatSmartNumber(monthTotal)}</span>
        </div>
      </div>

      <Button onClick={() => handleGoToTransitionsPage(type)} className={styles.button}>
        {CardInfoMapper[type].bottomButtonTitle}
      </Button>
    </div>
  );
};
