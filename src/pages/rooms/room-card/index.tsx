import { CSSProperties } from 'react';
import { Icon } from '@iconify/react';

import { AvatarCircle } from '@/components/avatar-circle';
import { RoomIdentity } from '@/components/room-identity';
import { Button } from '@/components/shared/button';
import { getRoomCardMeta } from '@/lib/get-room-card-meta';
import { pluralizeRu } from '@/lib/pluralize-ru';
import { RoomType } from '@/types/room';

import { PARTICIPANT_PLURAL_FORMS } from './constants';

import styles from './styles.module.css';

type Props = {
  room: RoomType;
  currentUserId?: string;
  onOpen: (roomId: string) => void;
};

export const RoomCard = ({ room, currentUserId, onOpen }: Props) => {
  const meta = getRoomCardMeta(room, currentUserId);
  const memberIds = Object.keys(room.members || {});
  const visibleAvatarIds = memberIds.slice(0, 3);
  const description = room.description?.trim() ? room.description : 'Совместный бюджет';

  return (
    <Button
      className={styles.card}
      onClick={() => onOpen(room.roomId)}
      aria-label={`Открыть комнату ${room.name}`}
    >
      <div
        className={styles.cover}
        style={{ '--cover-gradient': meta.coverGradient } as CSSProperties}
      >
        <span className={styles.coverShift} />
        <span className={styles.coverOverlay} />
      </div>

      <div className={styles.body}>
        <RoomIdentity
          room={room}
          title={
            <span className={styles.roomName} title={room.name}>
              {room.name}
            </span>
          }
          description={
            <span className={styles.roomDescription} title={description}>
              {description}
            </span>
          }
        />

        <dl className={styles.metaRow}>
          <div className={styles.metaItem}>
            <dt>
              <Icon icon="solar:users-group-rounded-bold" width={14} height={14} />
              Состав
            </dt>
            <dd>{meta.floorLabel}</dd>
          </div>
          <div className={styles.metaItem}>
            <dt>
              <Icon icon="solar:wallet-bold" width={14} height={14} />
              Тип
            </dt>
            <dd title={meta.typeFullLabel}>{meta.typeLabel}</dd>
          </div>
        </dl>

        <div className={styles.footer}>
          {visibleAvatarIds.length > 0 && (
            <div className={styles.avatarStack}>
              {visibleAvatarIds.map((memberId) => (
                <span key={memberId} className={styles.avatarItem}>
                  <AvatarCircle id={memberId} width={22} height={22} />
                </span>
              ))}
            </div>
          )}

          <span className={styles.membersMeta}>
            {meta.membersCount} {pluralizeRu(meta.membersCount, PARTICIPANT_PLURAL_FORMS)}
          </span>
        </div>
      </div>
    </Button>
  );
};
