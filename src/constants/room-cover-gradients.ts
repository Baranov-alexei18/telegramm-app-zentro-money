export enum RoomCoverGradientId {
  INDIGO = 'indigo',
  AZURE = 'azure',
  MINT = 'mint',
  SUNSET = 'sunset',
  VIOLET = 'violet',
  OCEAN = 'ocean',
  ROSE = 'rose',
  SLATE = 'slate',
}

export type RoomCoverGradientType = {
  id: RoomCoverGradientId;
  label: string;
  css: string;
};

export const ROOM_COVER_GRADIENTS: RoomCoverGradientType[] = [
  {
    id: RoomCoverGradientId.INDIGO,
    label: 'Индиго',
    css: 'linear-gradient(145deg, #818cf8 0%, #6366f1 48%, #1e1b4b 100%)',
  },
  {
    id: RoomCoverGradientId.AZURE,
    label: 'Лазурь',
    css: 'linear-gradient(145deg, #7dd3fc 0%, #3b82f6 50%, #1e3a8a 100%)',
  },
  {
    id: RoomCoverGradientId.MINT,
    label: 'Мята',
    css: 'linear-gradient(145deg, #6ee7b7 0%, #14b8a6 48%, #065f46 100%)',
  },
  {
    id: RoomCoverGradientId.SUNSET,
    label: 'Закат',
    css: 'linear-gradient(145deg, #fdba74 0%, #f97316 42%, #be185d 100%)',
  },
  {
    id: RoomCoverGradientId.VIOLET,
    label: 'Фиолет',
    css: 'linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 46%, #4c1d95 100%)',
  },
  {
    id: RoomCoverGradientId.OCEAN,
    label: 'Океан',
    css: 'linear-gradient(145deg, #67e8f9 0%, #0ea5e9 48%, #1d4ed8 100%)',
  },
  {
    id: RoomCoverGradientId.ROSE,
    label: 'Роза',
    css: 'linear-gradient(145deg, #fda4af 0%, #fb7185 45%, #9f1239 100%)',
  },
  {
    id: RoomCoverGradientId.SLATE,
    label: 'Графит',
    css: 'linear-gradient(145deg, #94a3b8 0%, #475569 50%, #0f172a 100%)',
  },
];

export const DEFAULT_ROOM_COVER_GRADIENT_ID = RoomCoverGradientId.INDIGO;
