import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

import { TransactionForm } from '@/components/forms/transaction-form';
import { BottomSheet } from '@/components/shared/bottom-sheet';
import { Button } from '@/components/shared/button';
import { notificationManager } from '@/components/shared/toast/utils';
import { ROUTE_PATHS } from '@/constants/route-path';
import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { getRoomUsers } from '@/services/firebase/getRoomUsers';
import { getUserRooms } from '@/services/firebase/getUserRooms';
import { useAppStore } from '@/store/appStore';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';
import { RolesRoom } from '@/types/room';
import { TransactionFormValues } from '@/types/transaction';
import { UserWithRoleRoom } from '@/types/user';

import { NotificationPanel } from './notification-panel';

import styles from './styles.module.css';

export const RoomPage = () => {
  const { user } = useUserStore();
  const { room, setRoom, fetchTransactions, addTransaction } = useRoomStore();
  const { closeTopBottomSheet } = useAppStore();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [membersInfo, setMembersInfo] = useState<UserWithRoleRoom[]>([]);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!user) return;

      let currentRoom = room;

      try {
        if (!currentRoom?.id) {
          const rooms = await getUserRooms(user.id);

          currentRoom = rooms.find((r) => r.id === id) || null;
        }

        if (!currentRoom?.id) return;

        setRoom(currentRoom);

        const [_, users] = await Promise.all([
          fetchTransactions(currentRoom.id),
          getRoomUsers(currentRoom),
        ]);

        setMembersInfo(users);

        setMembersInfo(users);
      } catch (e) {
        console.error('Ошибка при загрузке комнаты или участников:', e);
      }
    };

    fetchRoom();
  }, [user, id, fetchTransactions, setRoom, room]);

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

  const handleGoToTransitionsPage = (type: TRANSACTION_TYPE) => {
    navigate(`${location.pathname}${ROUTE_PATHS.transactions}`, { state: { type } });
  };

  const handleCopyIdRoom = async () => {
    try {
      await navigator.clipboard.writeText(room.id);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = room.id;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    notificationManager.add(
      {
        title: 'Ссылка скопирована',
        type: 'ok',
      },
      { timeout: 1000 }
    );
  };

  const lastTransactions = room.transactions?.slice(-5).reverse() || [];

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>{room.name}</h1>
        <p className={styles.description}>{room.description}</p>

        {membersInfo.length > 0 && (
          <BottomSheet
            id="room-members"
            triggerComponent={
              <div className={styles.membersTrigger}>
                👥 {membersInfo.length} участник{membersInfo.length > 1 ? 'ов' : ''}
              </div>
            }
          >
            <div className={styles.membersList}>
              <h3 className={styles.membersTitle}>Участники комнаты ({membersInfo.length} из 5)</h3>
              <Button onClick={handleCopyIdRoom}>Добавить нового участника</Button>
              <ul className={styles.membersListWrapper}>
                {membersInfo.map((member) => (
                  <li key={member.id} className={styles.memberItem}>
                    <div className={styles.memberAvatar}>{member.firstName}</div>
                    <div className={styles.memberInfo}>
                      <p className={styles.memberName}>
                        {member.firstName || member.email}{' '}
                        {member.role === RolesRoom.ADMIN && (
                          <span className={styles.adminBadge}>Админ</span>
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </BottomSheet>
        )}
      </header>

      <NotificationPanel notifications={room.notifications} />

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
        <Button onClick={() => handleGoToTransitionsPage(TRANSACTION_TYPE.INCOME)}>
          Все поступления
        </Button>
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
        <Button onClick={() => handleGoToTransitionsPage(TRANSACTION_TYPE.EXPENSE)}>
          Все траты
        </Button>
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
