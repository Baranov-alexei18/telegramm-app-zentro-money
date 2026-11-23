import { describe, expect, it } from 'vitest';

import { RoomKind } from '@/constants/room-kind';
import { RoomUserRole } from '@/constants/room-roles';
import { RoomType } from '@/types/room';

import { getRoomCardMeta } from './get-room-card-meta';

const createRoom = (overrides: Partial<RoomType> = {}): RoomType => ({
  roomId: 'room-1',
  name: 'Семейный бюджет',
  description: 'Общие расходы',
  categories: [],
  members: {
    'user-1': { role: RoomUserRole.ADMIN, joineredAt: new Date('2026-01-01') },
  },
  notifications: [],
  ...overrides,
});

describe('getRoomCardMeta', () => {
  it('должен считать состав как N / 5 для общих трат', () => {
    const meta = getRoomCardMeta(
      createRoom({
        kind: RoomKind.SHARED_EXPENSES,
        members: {
          'user-1': { role: RoomUserRole.ADMIN, joineredAt: new Date('2026-01-01') },
          'user-2': { role: RoomUserRole.USER, joineredAt: new Date('2026-01-02') },
          'user-3': { role: RoomUserRole.USER, joineredAt: new Date('2026-01-03') },
        },
      })
    );

    expect(meta.floorLabel).toBe('3 / 5');
    expect(meta.typeLabel).toBe('Общие траты');
  });

  it('должен считать состав как 1 / 1 для комнаты на одного человека', () => {
    const meta = getRoomCardMeta(createRoom({ kind: RoomKind.SINGLE_PERSON }));

    expect(meta.floorLabel).toBe('1 / 1');
    expect(meta.typeLabel).toBe('Личный');
  });

  it('должен считать комнату общими тратами, если kind не задан', () => {
    expect(getRoomCardMeta(createRoom()).typeLabel).toBe('Общие траты');
    expect(getRoomCardMeta(createRoom()).floorLabel).toBe('1 / 5');
    expect(
      getRoomCardMeta(
        createRoom({
          members: {
            'user-1': { role: RoomUserRole.ADMIN, joineredAt: new Date('2026-01-01') },
            'user-2': { role: RoomUserRole.USER, joineredAt: new Date('2026-01-02') },
          },
        })
      ).typeLabel
    ).toBe('Общие траты');
  });

  it('должен ставить роль «Администратор» для admin и «Участник» в остальных случаях', () => {
    expect(getRoomCardMeta(createRoom(), 'user-1').roleLabel).toBe('Администратор');
    expect(
      getRoomCardMeta(
        createRoom({
          members: {
            'user-1': { role: RoomUserRole.USER, joineredAt: new Date('2026-01-01') },
          },
        }),
        'user-1'
      ).roleLabel
    ).toBe('Участник');
    expect(getRoomCardMeta(createRoom()).roleLabel).toBe('Участник');
  });

  it('должен брать сохранённый градиент, если он задан у комнаты', () => {
    const meta = getRoomCardMeta(createRoom({ coverGradientId: 'sunset' }));

    expect(meta.coverGradientId).toBe('sunset');
    expect(meta.coverGradient).toContain('linear-gradient');
  });

  it('должен выбирать градиент детерминированно по roomId, если поле не задано', () => {
    const first = getRoomCardMeta(createRoom({ roomId: 'alpha' }));
    const second = getRoomCardMeta(createRoom({ roomId: 'alpha' }));

    expect(first.coverGradient).toBe(second.coverGradient);
    expect(first.coverGradient).toContain('linear-gradient');
  });
});
