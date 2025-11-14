import { ROLE_ROOM_MATRIX } from '@/constants/role-room-matrix';
import { RoomUserRole } from '@/constants/room-roles';
import { PermissionRoom } from '@/types/room';

export const canInRoom = (role: RoomUserRole | undefined, permission: PermissionRoom) => {
  if (!role) return false;

  return ROLE_ROOM_MATRIX[role]?.includes(permission) ?? false;
};
