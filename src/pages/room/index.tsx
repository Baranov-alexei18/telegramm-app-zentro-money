import { Fragment, useEffect } from 'react';
import { useParams } from 'react-router';

import { BackButton } from '@/components/back-button';
import { Header } from '@/components/header';
import { StatisticsIcon } from '@/components/icons/statistics-icon';
import { LinkButton } from '@/components/shared/link-button';
import { ROUTE_PATHS } from '@/constants/route-path';
import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { useRoomAccess } from '@/hooks/useRoomAccess';
import { getUserRooms } from '@/services/firebase/getUserRooms';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';

import { CardInfo } from './card-info';
import { ChatPanel } from './chat-panel';
import { MembersPanel } from './members-panel';
import { NotificationPanel } from './notification-panel';
import { TransactionCard } from './transaction-card';
import { filterMembersByRoom } from './utils';

import styles from './styles.module.css';

export const RoomPage = () => {
  const { user } = useUserStore();
  const { canViewNotifications } = useRoomAccess();
  const { room, setRoom, fetchTransactions, fetchMembers, members } = useRoomStore();

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchRoom = async () => {
      if (!user) return;

      try {
        const rooms = await getUserRooms(user.id);

        const currentRoom = rooms.find((r) => r.roomId === id) || null;

        if (!currentRoom?.roomId) return;

        setRoom(currentRoom);

        await Promise.all([fetchTransactions(currentRoom.roomId), fetchMembers(currentRoom)]);
      } catch (e) {
        console.error('Ошибка при загрузке комнаты или участников:', e);
      }
    };

    fetchRoom();
  }, [id]);

  const lastTransactions =
    room?.transactions
      ?.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
      ?.slice(-5)
      .reverse() || [];

  if (!room) {
    return <div className={styles.loader}>Загрузка...</div>;
  }

  return (
    <Fragment>
      <Header className={styles.headerWrapper}>
        <BackButton />

        <h2 className={styles.title}>Комната</h2>

        <div className={styles.headerIconWrapper}>
          <LinkButton
            href={`${location.pathname}${ROUTE_PATHS.statistics}`}
            className={styles.statisticIcon}
          >
            <StatisticsIcon />
          </LinkButton>
          <ChatPanel />
        </div>
      </Header>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1 className={styles.subTitle}>{room.name}</h1>
          <p className={styles.description}>{room.description}</p>

          <MembersPanel members={filterMembersByRoom(members, room.members)} />
        </div>

        {canViewNotifications() && <NotificationPanel notifications={room.notifications} />}

        <CardInfo type={TRANSACTION_TYPE.INCOME} />

        <CardInfo type={TRANSACTION_TYPE.EXPENSE} />

        <div>
          <h3 className={styles.subTitle}>Последние транзакции</h3>
          {lastTransactions.length ? (
            <ul className={styles.transactionsList}>
              {lastTransactions.map((t) => (
                <TransactionCard key={t.transactionId} transaction={t} />
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>Транзакций пока нет</p>
          )}
        </div>
      </div>
    </Fragment>
  );
};
