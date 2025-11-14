import { RoomUserRole } from '@/constants/room-roles';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';
import { PermissionRoom } from '@/types/room';
import { TransactionProps } from '@/types/transaction';
import { canInRoom } from '@/utils/canInRoom';

export const useRoomAccess = () => {
  const { user } = useUserStore();
  const { room } = useRoomStore();

  const role = room?.members[user?.id || '']?.role;

  if (!role || !user?.id) {
    return {
      canViewNotifications: () => false,

      canCreateTransaction: () => false,
      canModifyTransaction: () => false,
      canDeleteTransaction: () => false,

      canCreateCategory: () => false,
      canModifyCategory: () => false,
      canDeleteCategory: () => false,
    };
  }

  return {
    canViewNotifications: () => canInRoom(role, PermissionRoom.NOTIFICATION_VIEW),

    canCreateTransaction: () => canInRoom(role, PermissionRoom.TRANSACTION_CREATE),

    canModifyTransaction: (transaction: TransactionProps) => {
      if (role === RoomUserRole.ADMIN && canInRoom(role, PermissionRoom.TRANSACTION_DELETE)) {
        return true;
      }

      return canInRoom(role, PermissionRoom.TRANSACTION_DELETE) && transaction.userId === user.id;
    },

    canDeleteTransaction: (transaction: TransactionProps) => {
      if (role === RoomUserRole.ADMIN && canInRoom(role, PermissionRoom.TRANSACTION_DELETE)) {
        return true;
      }

      return canInRoom(role, PermissionRoom.TRANSACTION_DELETE) && transaction.userId === user.id;
    },

    canCreateCategory: () => canInRoom(role, PermissionRoom.CATEGORY_CREATE),

    canModifyCategory: () => canInRoom(role, PermissionRoom.CATEGORY_UPDATE),

    canDeleteCategory: () => canInRoom(role, PermissionRoom.CATEGORY_DELETE),
  };
};
