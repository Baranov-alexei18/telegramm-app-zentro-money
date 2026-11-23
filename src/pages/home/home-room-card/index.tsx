import { CSSProperties } from 'react';
import { Icon } from '@iconify/react';

import { AvatarCircle } from '@/components/avatar-circle';
import { RoomIdentity } from '@/components/room-identity';
import { Button } from '@/components/shared/button';
import { pluralizeRu } from '@/lib/pluralize-ru';
import { resolveRoomCoverGradient } from '@/lib/resolve-room-cover-gradient';
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
  const cover = resolveRoomCoverGradient(room);

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
      <span
        className={styles.accentBar}
        style={{ '--cover-gradient': cover.css } as CSSProperties}
      />

      <div className={styles.cardTop}>
        <RoomIdentity
          room={room}
          title={
            <span className={styles.roomName} title={room.name}>
              {room.name}
            </span>
          }
          description={
            <span className={styles.roomDescription} title={room.description?.trim() || undefined}>
              {room.description?.trim() ? room.description : 'Совместный бюджет'}
            </span>
          }
        />

        <div className={styles.topRight}>
          {notificationsCount > 0 && (
            <span className={styles.notificationBadge}>{notificationsCount}</span>
          )}
          <span className={styles.arrowIcon}>
            <Icon icon="mingcute:right-line" width={18} height={18} />
          </span>
        </div>
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
