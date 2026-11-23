export enum RoomKind {
  SHARED_EXPENSES = 'shared_expenses',
  SINGLE_PERSON = 'single_person',
}

export const ROOM_KIND_LABEL: Record<RoomKind, string> = {
  [RoomKind.SHARED_EXPENSES]: 'Общие траты',
  [RoomKind.SINGLE_PERSON]: 'Личный',
};

export const ROOM_KIND_HINT: Record<RoomKind, string> = {
  [RoomKind.SHARED_EXPENSES]: 'До 5 участников',
  [RoomKind.SINGLE_PERSON]: 'Только один участник',
};

export const ROOM_KIND_OPTIONS: RoomKind[] = [RoomKind.SHARED_EXPENSES, RoomKind.SINGLE_PERSON];
