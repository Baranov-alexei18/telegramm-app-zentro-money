import { Fragment, ReactNode } from 'react';
import { Icon } from '@iconify/react';

import { AvatarCircle } from '@/components/avatar-circle';
import { BottomSheet } from '@/components/shared/bottom-sheet';
import { Button } from '@/components/shared/button';
import { notificationManager } from '@/components/shared/toast/utils';
import { RoomKind } from '@/constants/room-kind';
import { RoomUserRole } from '@/constants/room-roles';
import { useRoomAccess } from '@/hooks/useRoomAccess';
import { getRoomJoinLimitError } from '@/lib/get-room-join-limit-error';
import { getRoomMemberLimit } from '@/lib/get-room-member-limit';
import { resolveRoomKind } from '@/lib/resolve-room-kind';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';
import { UserWithRoleRoom } from '@/types/user';
import { getUsername } from '@/utils/getUsername';

import styles from './styles.module.css';

type Props = {
  members: UserWithRoleRoom[];
  triggerComponent?: ReactNode;
  classNameWrapperTrigger?: string;
};

export const MembersPanel = ({
  members = [],
  triggerComponent,
  classNameWrapperTrigger,
}: Props) => {
  const { room, removeUserFromRoom, transferRoomAdmin } = useRoomStore();
  const { user } = useUserStore();
  const { canDeleteUser, canUpdateRoom } = useRoomAccess();
  const canManageMembers = canUpdateRoom();
  const isCurrentAdmin = Boolean(user?.id && room?.members?.[user.id]?.role === RoomUserRole.ADMIN);
  const kind = room ? resolveRoomKind(room) : RoomKind.SHARED_EXPENSES;
  const memberLimit = getRoomMemberLimit(kind);
  const roomMembers = Object.keys(room?.members || {});
  const joinLimitError = room ? getRoomJoinLimitError(room) : null;
  const canInvite = canManageMembers && kind === RoomKind.SHARED_EXPENSES && !joinLimitError;

  const handleCopyIdRoom = async () => {
    if (!canInvite) {
      notificationManager.add(
        {
          title: joinLimitError || 'Нельзя добавить участников в эту комнату',
          type: 'warn',
        },
        { timeout: 1500 }
      );
      return;
    }

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
    removeUserFromRoom(id);
  };

  const handleTransferAdmin = async (targetUserId: string) => {
    try {
      await transferRoomAdmin(targetUserId);
    } catch {
      // Тост показывает store.
    }
  };

  return (
    <BottomSheet
      id="room-members"
      classNameWrapperTrigger={classNameWrapperTrigger}
      triggerComponent={
        triggerComponent ?? (
          <div className={styles.membersTrigger}>
            <Icon icon="glyphs:users-1-bold" height={20} width={20} />
            {canManageMembers
              ? `Участники · ${roomMembers.length} из ${memberLimit}`
              : `Участники · ${roomMembers.length}`}
          </div>
        )
      }
    >
      <Fragment>
        <h4 className={styles.membersTitle}>
          {canManageMembers
            ? `Участники комнаты (${roomMembers.length} из ${memberLimit})`
            : `Участники комнаты (${roomMembers.length})`}
        </h4>

        {canManageMembers && kind === RoomKind.SHARED_EXPENSES && (
          <Button onClick={handleCopyIdRoom} isDisabled={!canInvite} className={styles.addButton}>
            {canInvite ? 'Добавить нового участника' : 'Комната заполнена'}
          </Button>
        )}

        <ul className={styles.membersListWrapper}>
          {members.map((member) => {
            const canTransferToMember =
              isCurrentAdmin && member.role === RoomUserRole.USER && member.id !== user?.id;
            const canRemoveMember = canDeleteUser() && member.id !== user?.id;

            return (
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

                {(canTransferToMember || canRemoveMember) && (
                  <div className={styles.memberActions}>
                    {canTransferToMember && (
                      <Button
                        className={styles.transferBtn}
                        onClick={() => handleTransferAdmin(member.id)}
                      >
                        Передать админку
                      </Button>
                    )}
                    {canRemoveMember && (
                      <Button className={styles.removeBtn} onClick={() => handleRemove(member.id)}>
                        🗑️
                      </Button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Fragment>
    </BottomSheet>
  );
};
