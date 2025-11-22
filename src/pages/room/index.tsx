import { Fragment, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { AvatarCircle } from '@/components/avatar-circle';
import { BackButton } from '@/components/back-button';
import { Header } from '@/components/header';
import { BottomSheet } from '@/components/shared/bottom-sheet';
import { Button } from '@/components/shared/button';
import { notificationManager } from '@/components/shared/toast/utils';
import { RoomUserRole } from '@/constants/room-roles';
import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { useRoomAccess } from '@/hooks/useRoomAccess';
import { getRoomUsers } from '@/services/firebase/getRoomUsers';
import { getUserRooms } from '@/services/firebase/getUserRooms';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';
import { UserWithRoleRoom } from '@/types/user';
import { getUsername } from '@/utils/getUsername';

import { CardInfo } from './card-info';
import { ChatPanel } from './chat-panel';
import { NotificationPanel } from './notification-panel';
import { TransactionCard } from './transaction-card';

import styles from './styles.module.css';

export const RoomPage = () => {
  const { user } = useUserStore();
  const { canViewNotifications } = useRoomAccess();
  const { room, setRoom, fetchTransactions } = useRoomStore();

  const { id } = useParams<{ id: string }>();

  const [membersInfo, setMembersInfo] = useState<UserWithRoleRoom[]>([]);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!user) return;

      try {
        const rooms = await getUserRooms(user.id);

        const currentRoom = rooms.find((r) => r.roomId === id) || null;

        if (!currentRoom?.roomId) return;

        setRoom(currentRoom);

        const [_, users] = await Promise.all([
          fetchTransactions(currentRoom.roomId),
          getRoomUsers(currentRoom),
        ]);

        setMembersInfo(users);
      } catch (e) {
        console.error('Ошибка при загрузке комнаты или участников:', e);
      }
    };

    fetchRoom();
  }, [id]);

  if (!room) {
    return <div className={styles.loader}>Загрузка...</div>;
  }

  const handleCopyIdRoom = async () => {
    try {
      await navigator.clipboard.writeText(room.roomId);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = room.roomId;
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

  const lastTransactions =
    room.transactions
      ?.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
      ?.slice(-5)
      .reverse() || [];

  return (
    <Fragment>
      <Header>
        <BackButton />
      </Header>
      <div className={styles.wrapper}>
        <div className={styles.header}>
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
                <h3 className={styles.membersTitle}>
                  Участники комнаты ({membersInfo.length} из 5)
                </h3>
                <Button onClick={handleCopyIdRoom}>Добавить нового участника</Button>
                <ul className={styles.membersListWrapper}>
                  {membersInfo.map((member) => (
                    <li key={member.id} className={styles.memberItem}>
                      <AvatarCircle id={member.id} height={36} width={36} />
                      <div className={styles.memberInfo}>
                        <p className={styles.memberName}>
                          {getUsername(member)}{' '}
                          {member.role === RoomUserRole.ADMIN && (
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
        </div>

        {canViewNotifications() && <NotificationPanel notifications={room.notifications} />}

        <ChatPanel />

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
