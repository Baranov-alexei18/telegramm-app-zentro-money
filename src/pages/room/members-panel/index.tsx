import { Fragment } from 'react/jsx-runtime';
import { Icon } from '@iconify/react';

import { AvatarCircle } from '@/components/avatar-circle';
import { BottomSheet } from '@/components/shared/bottom-sheet';
import { Button } from '@/components/shared/button';
import { notificationManager } from '@/components/shared/toast/utils';
import { RoomUserRole } from '@/constants/room-roles';
import { useRoomAccess } from '@/hooks/useRoomAccess';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';
import { UserWithRoleRoom } from '@/types/user';
import { getUsername } from '@/utils/getUsername';

import styles from './styles.module.css';

type Props = {
  members: UserWithRoleRoom[];
};

export const MembersPanel = ({ members = [] }: Props) => {
  const { room, removeUserFromRoom } = useRoomStore();
  const { user } = useUserStore();
  const { canDeleteUser } = useRoomAccess();
  const isAdmin = true;

  const handleCopyIdRoom = async () => {
    try {
      await navigator.clipboard.writeText(room?.roomId || '');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = room?.roomId || '';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    notificationManager.add({ title: 'Ссылка скопирована', type: 'ok' }, { timeout: 1000 });
  };

  const handleRemove = (id: string) => {
    if (!isAdmin) return;

    removeUserFromRoom(id);

    notificationManager.add({ title: 'Пользователь удалён', type: 'ok' }, { timeout: 1200 });
  };

  const roomMembers = Object.keys(room?.members || {});

  return (
    <BottomSheet
      id="room-members"
      triggerComponent={
        <div className={styles.membersTrigger}>
          <Icon icon="glyphs:users-1-bold" height={20} width={20} />
          {roomMembers.length} участник
          {roomMembers.length > 1 ? 'ов' : ''}
        </div>
      }
    >
      <Fragment>
        <h4 className={styles.membersTitle}>Участники комнаты ({roomMembers.length} из 5)</h4>

        <Button onClick={handleCopyIdRoom} className={styles.addButton}>
          Добавить нового участника
        </Button>

        <ul className={styles.membersListWrapper}>
          {members.map((member) => (
            <li key={member.id} className={styles.memberItem}>
              <div className={styles.memberLeft}>
                <AvatarCircle id={member.id} height={36} width={36} />

                <div className={styles.memberInfo}>
                  <p className={styles.memberName}>
                    {getUsername(member)}
                    {member.role === RoomUserRole.ADMIN && (
                      <span className={styles.adminBadge}>Админ</span>
                    )}
                  </p>
                </div>
              </div>

              {canDeleteUser() && member.id !== user?.id && (
                <Button className={styles.removeBtn} onClick={() => handleRemove(member.id)}>
                  🗑️
                </Button>
              )}
            </li>
          ))}
        </ul>
      </Fragment>
    </BottomSheet>
  );
};
