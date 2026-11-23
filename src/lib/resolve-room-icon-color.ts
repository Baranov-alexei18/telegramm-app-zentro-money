import { ROOM_COVER_GRADIENTS } from '@/constants/room-cover-gradients';
import { DEFAULT_ROOM_ICON_COLOR_ID, ROOM_ICON_COLOR_MATCH_COVER } from '@/constants/room-icons';
import { RoomType } from '@/types/room';

import { getRoomCoverGradientById, resolveRoomCoverGradient } from './resolve-room-cover-gradient';

export type RoomIconColorType = {
  id: string;
  css: string;
  isMatchCover: boolean;
};

export const resolveRoomIconColor = (
  room: Pick<RoomType, 'roomId' | 'coverGradientId' | 'iconColorId'>
): RoomIconColorType => {
  const cover = resolveRoomCoverGradient(room);
  const storedId = room.iconColorId?.trim();

  if (!storedId || storedId === ROOM_ICON_COLOR_MATCH_COVER) {
    return {
      id: DEFAULT_ROOM_ICON_COLOR_ID,
      css: cover.css,
      isMatchCover: true,
    };
  }

  const stored = getRoomCoverGradientById(storedId);

  if (stored) {
    return {
      id: stored.id,
      css: stored.css,
      isMatchCover: false,
    };
  }

  const fallback =
    ROOM_COVER_GRADIENTS.find((gradient) => gradient.id === cover.id) ?? ROOM_COVER_GRADIENTS[0];

  return {
    id: DEFAULT_ROOM_ICON_COLOR_ID,
    css: fallback?.css ?? cover.css,
    isMatchCover: true,
  };
};
