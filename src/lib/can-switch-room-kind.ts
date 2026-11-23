import { RoomKind } from '@/constants/room-kind';

export const ROOM_KIND_SWITCH_BLOCKED_MESSAGE = 'Сначала удалите лишних участников';

export const canSwitchRoomKind = (
  currentKind: RoomKind,
  nextKind: RoomKind,
  membersCount: number
): boolean => {
  if (currentKind === nextKind) {
    return true;
  }

  if (nextKind === RoomKind.SINGLE_PERSON && membersCount > 1) {
    return false;
  }

  return true;
};
