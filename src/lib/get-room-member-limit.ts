import { RoomKind } from '@/constants/room-kind';

export const ROOM_MEMBER_LIMIT = {
  [RoomKind.SINGLE_PERSON]: 1,
  [RoomKind.SHARED_EXPENSES]: 5,
} as const;

export const getRoomMemberLimit = (kind: RoomKind): number => ROOM_MEMBER_LIMIT[kind];
