import { RoomKind } from '@/constants/room-kind';
import { RoomType } from '@/types/room';

export const hasPersistedRoomKind = (kind: unknown): kind is RoomKind =>
  kind === RoomKind.SHARED_EXPENSES || kind === RoomKind.SINGLE_PERSON;

export const deriveRoomKind = (_membersCount: number): RoomKind => RoomKind.SHARED_EXPENSES;

export const resolveRoomKind = (room: Pick<RoomType, 'kind' | 'members'>): RoomKind => {
  if (hasPersistedRoomKind(room.kind)) {
    return room.kind;
  }

  return deriveRoomKind(Object.keys(room.members ?? {}).length);
};
