import { ChangeEvent, Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Icon } from '@iconify/react';

import { BackButton } from '@/components/back-button';
import { CreateRoomForm } from '@/components/forms/create-room-form';
import { Header } from '@/components/header';
import { ArrowRightIcon } from '@/components/icons/arrow-right-icon';
import { BottomSheet } from '@/components/shared/bottom-sheet';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { notificationManager } from '@/components/shared/toast/utils';
import { ROUTE_PATHS } from '@/constants/route-path';
import { sendJoinRoomRequest } from '@/services/firebase/sendJoinRoomRequest';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';

import { RoomCard } from './room-card';

import styles from './styles.module.css';

const SKELETON_CARDS = [0, 1, 2];

export const RoomsPage = () => {
  const { user } = useUserStore();
  const { userRooms, isUserRoomsLoading, hasLoadedUserRooms, loadedRoomsUserId, fetchUserRooms } =
    useRoomStore();
  const [roomId, setRoomId] = useState('');

  const navigate = useNavigate();

  const isRoomsPending = Boolean(
    user && (isUserRoomsLoading || !hasLoadedUserRooms || loadedRoomsUserId !== user.id)
  );

  useEffect(() => {
    if (!user?.id) return;
    if (hasLoadedUserRooms && loadedRoomsUserId === user.id) return;

    fetchUserRooms(user.id).catch((error) => {
      console.error(error);
    });
  }, [fetchUserRooms, hasLoadedUserRooms, loadedRoomsUserId, user?.id]);

  const handleToRoom = (id: string) => {
    navigate(`${ROUTE_PATHS.room}/${id}`);
  };

  const handleConnectToRoom = async () => {
    if (!roomId.trim() || !user) {
      notificationManager.add(
        {
          title: 'Идентификатор комнаты не введен',
          type: 'error',
        },
        { timeout: 1000 }
      );

      return;
    }

    const data = await sendJoinRoomRequest(roomId, user);

    if (data?.success) {
      notificationManager.add(
        {
          title: 'Заявка в комнату отправлена, ожидайте...',
          type: 'ok',
        },
        { timeout: 2000 }
      );

      setRoomId('');
    }
  };

  const handleRoomIdChange = (e: ChangeEvent<HTMLInputElement>) => setRoomId(e.target.value);

  return (
    <Fragment>
      <Header className={styles.headerWrapper}>
        <BackButton />

        <h2 className={styles.title}>Мои комнаты</h2>

        <BottomSheet
          triggerComponent={
            <div className={styles.create}>
              <Icon icon="solar:home-add-bold" width={16} height={16} />
              Создать комнату
            </div>
          }
          id="create-room"
        >
          <CreateRoomForm />
        </BottomSheet>
      </Header>
      <div className={styles.wrapper}>
        <div className={styles.connectRoom}>
          <div className={styles.connectField}>
            <Input onChange={handleRoomIdChange} value={roomId} placeholder="Введите id комнаты" />
          </div>
          <Button onClick={handleConnectToRoom}>
            <ArrowRightIcon />
          </Button>
        </div>

        {isRoomsPending ? (
          <div className={styles.roomsGrid} aria-busy={true} aria-live="polite">
            {SKELETON_CARDS.map((item) => (
              <div key={item} className={styles.skeletonCard}>
                <div className={styles.skeletonCover} />
                <div className={styles.skeletonBody}>
                  <span className={styles.skeletonTitle} />
                  <span className={styles.skeletonText} />
                  <div className={styles.skeletonMeta}>
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : userRooms.length > 0 ? (
          <div className={styles.roomsGrid}>
            {userRooms.map((room) => (
              <RoomCard
                key={room.roomId}
                room={room}
                currentUserId={user?.id}
                onOpen={handleToRoom}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>Комнат пока нет</p>
            <p className={styles.emptyText}>
              Создайте свою первую комнату или присоединитесь по идентификатору.
            </p>
          </div>
        )}
      </div>
    </Fragment>
  );
};
