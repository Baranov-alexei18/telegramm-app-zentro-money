import {
  DEFAULT_ROOM_COVER_GRADIENT_ID,
  ROOM_COVER_GRADIENTS,
  RoomCoverGradientId,
  RoomCoverGradientType,
} from '@/constants/room-cover-gradients';
import { RoomType } from '@/types/room';

const GRADIENT_BY_ID = new Map(ROOM_COVER_GRADIENTS.map((gradient) => [gradient.id, gradient]));

const hashSeed = (value: string): number => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
};

export const getRoomCoverGradientById = (id?: string | null): RoomCoverGradientType | undefined => {
  if (!id) return undefined;

  return GRADIENT_BY_ID.get(id as RoomCoverGradientId);
};

export const resolveRoomCoverGradient = (
  room: Pick<RoomType, 'roomId' | 'coverGradientId'>
): RoomCoverGradientType => {
  const stored = getRoomCoverGradientById(room.coverGradientId);

  if (stored) {
    return stored;
  }

  const fallbackIndex = hashSeed(room.roomId) % ROOM_COVER_GRADIENTS.length;

  return (
    ROOM_COVER_GRADIENTS[fallbackIndex] ??
    GRADIENT_BY_ID.get(DEFAULT_ROOM_COVER_GRADIENT_ID) ??
    ROOM_COVER_GRADIENTS[0]
  );
};
