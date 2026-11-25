import { describe, expect, it } from 'vitest';

import { RoomUserRole } from '@/constants/room-roles';
import { RoomType } from '@/types/room';

import { applyRoomAdminTransfer } from './transfer-room-admin-members';

const member = (role: RoomUserRole, joinedAt = '2026-01-01'): RoomType['members'][string] => ({
  role,
  joineredAt: new Date(joinedAt),
});

const members: RoomType['members'] = {
  'user-1': member(RoomUserRole.ADMIN, '2026-01-01'),
  'user-2': member(RoomUserRole.USER, '2026-01-02'),
  'user-3': member(RoomUserRole.ADMIN, '2026-01-03'),
};

describe('applyRoomAdminTransfer', () => {
  it('должен назначить цель админом и снять админку с вызывающего', () => {
    const next = applyRoomAdminTransfer(members, 'user-1', 'user-2');

    expect(next['user-1'].role).toBe(RoomUserRole.USER);
    expect(next['user-2'].role).toBe(RoomUserRole.ADMIN);
    expect(next['user-2'].joineredAt).toEqual(members['user-2'].joineredAt);
  });

  it('должен оставить других админов без изменений', () => {
    const next = applyRoomAdminTransfer(members, 'user-1', 'user-2');

    expect(next['user-3']).toEqual(members['user-3']);
  });

  it('должен отказывать, если цель уже админ', () => {
    expect(() => applyRoomAdminTransfer(members, 'user-1', 'user-3')).toThrow(
      'Участник уже администратор'
    );
  });

  it('должен отказывать, если вызывающий единственный участник', () => {
    expect(() =>
      applyRoomAdminTransfer({ 'user-1': member(RoomUserRole.ADMIN) }, 'user-1', 'user-2')
    ).toThrow('В комнате нет другого участника');
  });

  it('должен отказывать, если вызывающий не админ', () => {
    expect(() =>
      applyRoomAdminTransfer(
        {
          'user-1': member(RoomUserRole.USER),
          'user-2': member(RoomUserRole.USER),
        },
        'user-1',
        'user-2'
      )
    ).toThrow('Недостаточно прав');
  });

  it('должен отказывать, если цель не в комнате', () => {
    expect(() => applyRoomAdminTransfer(members, 'user-1', 'user-9')).toThrow(
      'Участник не найден в комнате'
    );
  });
});
