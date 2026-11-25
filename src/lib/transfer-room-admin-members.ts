import { RoomUserRole } from '@/constants/room-roles';
import { RoomType } from '@/types/room';

export const applyRoomAdminTransfer = (
  members: RoomType['members'] | undefined,
  callerId: string,
  targetUserId: string
): RoomType['members'] => {
  const source = members ?? {};
  const caller = source[callerId];

  if (!caller || caller.role !== RoomUserRole.ADMIN) {
    throw new Error('Недостаточно прав');
  }

  if (Object.keys(source).length < 2) {
    throw new Error('В комнате нет другого участника');
  }

  if (callerId === targetUserId) {
    throw new Error('Нельзя передать права самому себе');
  }

  const target = source[targetUserId];

  if (!target) {
    throw new Error('Участник не найден в комнате');
  }

  if (target.role === RoomUserRole.ADMIN) {
    throw new Error('Участник уже администратор');
  }

  if (target.role !== RoomUserRole.USER) {
    throw new Error('Передать права можно только участнику');
  }

  return {
    ...source,
    [callerId]: { ...caller, role: RoomUserRole.USER },
    [targetUserId]: { ...target, role: RoomUserRole.ADMIN },
  };
};
