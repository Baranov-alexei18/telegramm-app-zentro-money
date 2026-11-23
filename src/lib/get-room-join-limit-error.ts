import { RoomKind } from '@/constants/room-kind';
import { RoomType } from '@/types/room';

import { getRoomMemberLimit } from './get-room-member-limit';
import { resolveRoomKind } from './resolve-room-kind';

export const getRoomJoinLimitError = (room: Pick<RoomType, 'kind' | 'members'>): string | null => {
  const kind = resolveRoomKind(room);
  const limit = getRoomMemberLimit(kind);
  const membersCount = Object.keys(room.members ?? {}).length;

  if (membersCount < limit) {
    return null;
  }

  if (kind === RoomKind.SINGLE_PERSON) {
    return 'Эта комната только для одного человека';
  }

  return `В комнате максимальное количество людей — ${limit}`;
};
