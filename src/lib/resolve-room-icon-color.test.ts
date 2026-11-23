import { describe, expect, it } from 'vitest';

import { RoomCoverGradientId } from '@/constants/room-cover-gradients';
import { ROOM_ICON_COLOR_MATCH_COVER } from '@/constants/room-icons';

import { resolveRoomCoverGradient } from './resolve-room-cover-gradient';
import { resolveRoomIconColor } from './resolve-room-icon-color';

describe('resolveRoomIconColor', () => {
  it('должен брать цвет обложки, если цвет иконки не задан', () => {
    const room = { roomId: 'room-1', coverGradientId: RoomCoverGradientId.SUNSET };
    const cover = resolveRoomCoverGradient(room);
    const color = resolveRoomIconColor(room);

    expect(color.id).toBe(ROOM_ICON_COLOR_MATCH_COVER);
    expect(color.isMatchCover).toBe(true);
    expect(color.css).toBe(cover.css);
  });

  it('должен брать цвет обложки, если выбран режим «как обложка»', () => {
    const room = {
      roomId: 'room-1',
      coverGradientId: RoomCoverGradientId.MINT,
      iconColorId: ROOM_ICON_COLOR_MATCH_COVER,
    };
    const cover = resolveRoomCoverGradient(room);
    const color = resolveRoomIconColor(room);

    expect(color.isMatchCover).toBe(true);
    expect(color.css).toBe(cover.css);
  });

  it('должен брать сохранённый цвет иконки, если id известен', () => {
    const color = resolveRoomIconColor({
      roomId: 'room-1',
      coverGradientId: RoomCoverGradientId.SUNSET,
      iconColorId: RoomCoverGradientId.AZURE,
    });

    expect(color.id).toBe(RoomCoverGradientId.AZURE);
    expect(color.isMatchCover).toBe(false);
    expect(color.css).toContain('linear-gradient');
  });

  it('должен возвращаться к цвету обложки, если id цвета иконки неизвестен', () => {
    const room = {
      roomId: 'room-1',
      coverGradientId: RoomCoverGradientId.VIOLET,
      iconColorId: 'unknown-color',
    };
    const cover = resolveRoomCoverGradient(room);
    const color = resolveRoomIconColor(room);

    expect(color.isMatchCover).toBe(true);
    expect(color.css).toBe(cover.css);
  });
});
