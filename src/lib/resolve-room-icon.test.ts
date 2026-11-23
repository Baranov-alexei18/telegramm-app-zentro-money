import { describe, expect, it } from 'vitest';

import { DEFAULT_ROOM_ICON_ID, ROOM_ICONS, RoomIconId } from '@/constants/room-icons';

import { resolveRoomIcon } from './resolve-room-icon';

describe('resolveRoomIcon', () => {
  it('должен брать сохранённую иконку комнаты, если id известен', () => {
    const icon = resolveRoomIcon({ iconId: RoomIconId.WALLET });

    expect(icon.id).toBe(RoomIconId.WALLET);
    expect(icon.iconifyId).toBe('solar:wallet-bold');
  });

  it('должен возвращать иконку дома, если поле не задано', () => {
    const icon = resolveRoomIcon({});

    expect(icon.id).toBe(DEFAULT_ROOM_ICON_ID);
    expect(icon.iconifyId).toBe('proicons:home');
  });

  it('должен игнорировать неизвестный id и брать иконку по умолчанию', () => {
    const icon = resolveRoomIcon({ iconId: 'unknown-icon' });

    expect(ROOM_ICONS.some((item) => item.id === icon.id)).toBe(true);
    expect(icon.id).toBe(DEFAULT_ROOM_ICON_ID);
  });
});
