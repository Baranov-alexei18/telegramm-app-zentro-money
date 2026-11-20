import { Icon } from '@iconify/react';

import { AvatarCircle } from '@/components/avatar-circle';
import { Button } from '@/components/shared/button';
import { pluralizeRu } from '@/lib/pluralize-ru';
import { useUserStore } from '@/store/userStore';
import { PermissionRoom, RoomType } from '@/types/room';
import { canInRoom } from '@/utils/canInRoom';

import { PARTICIPANT_PLURAL_FORMS } from '../constants';

import styles from './styles.module.css';

type Props = {
  room: RoomType;
  onOpen: (roomId: string) => void;
};

export const HomeRoomCard = ({ room, onOpen }: Props) => {
  const { user } = useUserStore();

  const memberIds = Object.keys(room.members || {});
  const membersCount = memberIds.length;
  const visibleAvatarIds = memberIds.slice(0, 3);
  const currentUserRole = user?.id ? room.members?.[user.id]?.role : undefined;
  const canViewNotifications = currentUserRole
    ? canInRoom(currentUserRole, PermissionRoom.NOTIFICATION_VIEW)
    : false;
  const notificationsCount = canViewNotifications ? (room.notifications?.length ?? 0) : 0;

  return (
    <Button className={styles.card} onClick={() => onOpen(room.roomId)}>
      <span className={styles.accentBar} />

      <div className={styles.cardTop}>
        <span className={styles.iconBadge}>
          <Icon icon="proicons:home" width={18} height={18} />
        </span>

        <div className={styles.topRight}>
          {notificationsCount > 0 && (
            <span className={styles.notificationBadge}>{notificationsCount}</span>
          )}
          <span className={styles.arrowIcon}>
            <Icon icon="mingcute:right-line" width={18} height={18} />
          </span>
        </div>
      </div>

      <div className={styles.cardBody}>
        <span className={styles.roomName}>{room.name}</span>
        <span className={styles.roomDescription}>
          {room.description?.trim() ? room.description : 'Совместный бюджет'}
        </span>
      </div>

      <div className={styles.cardFooter}>
        {visibleAvatarIds.length > 0 && (
          <div className={styles.avatarStack}>
            {visibleAvatarIds.map((memberId) => (
              <span key={memberId} className={styles.avatarItem}>
                <AvatarCircle id={memberId} width={20} height={20} />
              </span>
            ))}
          </div>
        )}

        <span className={styles.membersMeta}>
          {membersCount} {pluralizeRu(membersCount, PARTICIPANT_PLURAL_FORMS)}
        </span>
      </div>
    </Button>
  );
};
