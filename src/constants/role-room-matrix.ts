import { PermissionRoom } from '@/types/room';

import { RoomUserRole } from './room-roles';

export const ROLE_ROOM_MATRIX: Record<RoomUserRole, PermissionRoom[]> = {
  [RoomUserRole.ADMIN]: [
    PermissionRoom.NOTIFICATION_VIEW,

    PermissionRoom.TRANSACTION_CREATE,
    PermissionRoom.TRANSACTION_UPDATE,
    PermissionRoom.TRANSACTION_DELETE,

    PermissionRoom.CATEGORY_CREATE,
    PermissionRoom.CATEGORY_UPDATE,
    PermissionRoom.CATEGORY_DELETE,

    PermissionRoom.REMOVE_USER,
  ],

  [RoomUserRole.USER]: [
    PermissionRoom.TRANSACTION_CREATE,
    PermissionRoom.TRANSACTION_UPDATE,
    PermissionRoom.TRANSACTION_DELETE,
  ],
};
