import { DEFAULT_ROOM_ICON_ID, ROOM_ICONS, RoomIconId, RoomIconType } from '@/constants/room-icons';
import { RoomType } from '@/types/room';

const ICON_BY_ID = new Map(ROOM_ICONS.map((icon) => [icon.id, icon]));

export const getRoomIconById = (id?: string | null): RoomIconType | undefined => {
  if (!id) return undefined;

  return ICON_BY_ID.get(id as RoomIconId);
};

export const resolveRoomIcon = (room: Pick<RoomType, 'iconId'>): RoomIconType => {
  const stored = getRoomIconById(room.iconId);

  if (stored) {
    return stored;
  }

  return ICON_BY_ID.get(DEFAULT_ROOM_ICON_ID) ?? ROOM_ICONS[0];
};
