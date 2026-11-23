import { ROOM_KIND_LABEL } from '@/constants/room-kind';
import { RoomUserRole } from '@/constants/room-roles';
import { RoomType } from '@/types/room';

import { getRoomMemberLimit } from './get-room-member-limit';
import { resolveRoomCoverGradient } from './resolve-room-cover-gradient';
import { resolveRoomKind } from './resolve-room-kind';

export type RoomCardMetaType = {
  coverGradientId: string;
  coverGradient: string;
  typeLabel: string;
  typeFullLabel: string;
  floorLabel: string;
  roleLabel: string;
  membersCount: number;
  memberLimit: number;
  notificationsCount: number;
};

export const getRoomCardMeta = (room: RoomType, userId?: string | null): RoomCardMetaType => {
  const membersCount = Object.keys(room.members ?? {}).length;
  const role = userId ? room.members?.[userId]?.role : undefined;
  const cover = resolveRoomCoverGradient(room);
  const kind = resolveRoomKind(room);
  const memberLimit = getRoomMemberLimit(kind);
  const notificationsCount = room.notifications?.length ?? 0;
  const typeLabel = ROOM_KIND_LABEL[kind];

  return {
    coverGradientId: cover.id,
    coverGradient: cover.css,
    typeLabel,
    typeFullLabel: typeLabel,
    floorLabel: `${membersCount} / ${memberLimit}`,
    roleLabel: role === RoomUserRole.ADMIN ? 'Администратор' : 'Участник',
    membersCount,
    memberLimit,
    notificationsCount,
  };
};
