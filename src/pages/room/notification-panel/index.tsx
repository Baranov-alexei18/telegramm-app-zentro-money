import { BottomSheet } from '@/components/shared/bottom-sheet';
import { getRoomJoinLimitError } from '@/lib/get-room-join-limit-error';
import { useRoomStore } from '@/store/roomStore';
import { NotificationRoomType } from '@/types/room';

import styles from './styles.module.css';

type Props = {
  notifications?: NotificationRoomType[];
};

export const NotificationPanel = ({ notifications = [] }: Props) => {
  const { room, removeNotification, addUserToRoom } = useRoomStore();

  const hasNotifications = notifications.length > 0;
  const joinLimitError = room ? getRoomJoinLimitError(room) : null;

  return (
    <div className={styles.panel}>
      <BottomSheet
        id="room-notifications"
        triggerComponent={
          <div className={styles.notificationsBtn}>
            🔔 Notifications
            {hasNotifications && <span className={styles.dot} />}
          </div>
        }
      >
        {hasNotifications ? (
          <ul className={styles.notificationsList}>
            {notifications.map((notification) => (
              <li key={notification.userId} className={styles.notificationItem}>
                <div className={styles.userInfo}>
                  {notification.name?.length ? notification.name : notification.email}
                </div>
                <div className={styles.actions}>
                  <button
                    className={styles.acceptBtn}
                    onClick={() => addUserToRoom(notification.userId)}
                    disabled={Boolean(joinLimitError)}
                    title={joinLimitError ?? undefined}
                  >
                    Принять
                  </button>
                  <button
                    className={styles.rejectBtn}
                    onClick={() => removeNotification(notification.userId)}
                  >
                    Отклонить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>Нет новых уведомлений</p>
        )}
      </BottomSheet>
    </div>
  );
};
