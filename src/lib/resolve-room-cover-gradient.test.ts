import { describe, expect, it } from 'vitest';

import { ROOM_COVER_GRADIENTS, RoomCoverGradientId } from '@/constants/room-cover-gradients';

import { resolveRoomCoverGradient } from './resolve-room-cover-gradient';

describe('resolveRoomCoverGradient', () => {
  it('должен брать сохранённый градиент комнаты, если id известен', () => {
    const gradient = resolveRoomCoverGradient({
      roomId: 'room-1',
      coverGradientId: RoomCoverGradientId.SUNSET,
    });

    expect(gradient.id).toBe(RoomCoverGradientId.SUNSET);
    expect(gradient.css).toContain('linear-gradient');
  });

  it('должен выбирать градиент по roomId, если поле не задано', () => {
    const first = resolveRoomCoverGradient({ roomId: 'alpha' });
    const second = resolveRoomCoverGradient({ roomId: 'alpha' });

    expect(first.id).toBe(second.id);
    expect(ROOM_COVER_GRADIENTS.some((gradient) => gradient.id === first.id)).toBe(true);
  });

  it('должен игнорировать неизвестный id и брать запасной градиент', () => {
    const gradient = resolveRoomCoverGradient({
      roomId: 'room-1',
      coverGradientId: 'unknown-gradient',
    });

    expect(ROOM_COVER_GRADIENTS.some((item) => item.id === gradient.id)).toBe(true);
  });
});
