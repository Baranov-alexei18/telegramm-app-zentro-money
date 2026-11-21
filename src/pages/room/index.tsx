import { Fragment, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Icon } from '@iconify/react';
import cn from 'classnames';

import { AppLoader } from '@/components/app-loader';
import { BackButton } from '@/components/back-button';
import { Header } from '@/components/header';
import { LinkButton } from '@/components/shared/link-button';
import { notificationManager } from '@/components/shared/toast/utils';
import { ROUTE_PATHS } from '@/constants/route-path';
import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { useRoomAccess } from '@/hooks/useRoomAccess';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';

import { CardInfo } from './card-info';
import { ChatPanel } from './chat-panel';
import { MembersPanel } from './members-panel';
import { NotificationPanel } from './notification-panel';
import { RoomBlurredFallback } from './room-blurred-fallback';
import { TransactionCard } from './transaction-card';
import { filterMembersByRoom, getLastTransactions } from './utils';

import styles from './styles.module.css';

export const RoomPage = () => {
  const { user } = useUserStore();
  const { canViewNotifications } = useRoomAccess();
  const { room, userRooms, loadedTransactionsRoomId, loadedMembersRoomId, members } =
    useRoomStore();

  const { id } = useParams<{ id: string }>();

  const isRoomHydrated = Boolean(
    id && room?.roomId === id && loadedTransactionsRoomId === id && loadedMembersRoomId === id
  );

  const [settledRoomId, setSettledRoomId] = useState<string | null>(() =>
    isRoomHydrated ? (id ?? null) : null
  );

  useEffect(() => {
    let isCancelled = false;

    const loadRoomData = async () => {
      if (!user?.id || !id) {
        setSettledRoomId(id ?? null);
        return;
      }

      const storeState = useRoomStore.getState();
      const alreadyHydrated =
        storeState.room?.roomId === id &&
        storeState.loadedTransactionsRoomId === id &&
        storeState.loadedMembersRoomId === id;

      if (alreadyHydrated) {
        setSettledRoomId(id);
        return;
      }

      try {
        let targetRoom =
          (storeState.room?.roomId === id ? storeState.room : null) ??
          storeState.userRooms.find((item) => item.roomId === id) ??
          null;

        if (!targetRoom) {
          const fetchedRooms = await storeState.fetchUserRooms(user.id);
          targetRoom = fetchedRooms.find((item) => item.roomId === id) ?? null;
        }

        if (isCancelled) return;

        if (!targetRoom?.roomId) {
          return;
        }

        storeState.setRoom(targetRoom);

        await Promise.all([
          storeState.fetchTransactions(targetRoom.roomId),
          storeState.fetchMembers(targetRoom),
        ]);
        await storeState.hydrateTransactionsFromQueue();
      } catch {
        if (!isCancelled) {
          notificationManager.add(
            { title: 'Ошибка при загрузке данных комнаты', type: 'error' },
            { timeout: 1500 }
          );
        }
      } finally {
        if (!isCancelled) {
          setSettledRoomId(id);
        }
      }
    };

    loadRoomData();

    return () => {
      isCancelled = true;
    };
  }, [id, user?.id]);

  const isInitialLoading = Boolean(user?.id && id && !isRoomHydrated && settledRoomId !== id);
  const activeRoom = room?.roomId === id ? room : null;
  const previewRoom = activeRoom ?? userRooms.find((item) => item.roomId === id) ?? null;
  const lastTransactions = getLastTransactions(activeRoom?.transactions);
  const statisticsHref = id
    ? `${ROUTE_PATHS.room}/${id}${ROUTE_PATHS.statistics}`
    : ROUTE_PATHS.rooms;

  return (
    <Fragment>
      <Header className={styles.headerWrapper}>
        <BackButton />

        <h2 className={styles.title}>Комната</h2>

        <div className={styles.headerIconWrapper}>
          <LinkButton href={statisticsHref} className={styles.statisticIcon}>
            <Icon icon="glyphs:chart-pie-slice-bold" height={28} width={28} />
          </LinkButton>
          <ChatPanel />
        </div>
      </Header>

      <div className={styles.bodyStage} aria-busy={isInitialLoading}>
        <div
          className={cn(styles.wrapper, {
            [styles.wrapperBlurred]: isInitialLoading,
          })}
        >
          {activeRoom ? (
            <>
              <div className={styles.header}>
                <h1 className={styles.subTitle}>{activeRoom.name}</h1>
                <p className={styles.description}>{activeRoom.description}</p>

                <MembersPanel members={filterMembersByRoom(members, activeRoom.members)} />
              </div>

              {canViewNotifications() && (
                <NotificationPanel notifications={activeRoom.notifications} />
              )}

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
            </>
          ) : isInitialLoading ? (
            <RoomBlurredFallback previewRoom={previewRoom} />
          ) : (
            <p className={styles.empty}>Комната не найдена</p>
          )}
        </div>

        {isInitialLoading && <AppLoader overlay={true} />}
      </div>
    </Fragment>
  );
};
