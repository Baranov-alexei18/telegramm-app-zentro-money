export enum RoomIconId {
  HOME = 'home',
  WALLET = 'wallet',
  USERS = 'users',
  CART = 'cart',
  HEART = 'heart',
  STAR = 'star',
  CASE = 'case',
  GIFT = 'gift',
}

export type RoomIconType = {
  id: RoomIconId;
  label: string;
  iconifyId: string;
};

export const ROOM_ICONS: RoomIconType[] = [
  { id: RoomIconId.HOME, label: 'Дом', iconifyId: 'proicons:home' },
  { id: RoomIconId.WALLET, label: 'Кошелёк', iconifyId: 'solar:wallet-bold' },
  { id: RoomIconId.USERS, label: 'Люди', iconifyId: 'solar:users-group-rounded-bold' },
  { id: RoomIconId.CART, label: 'Покупки', iconifyId: 'solar:cart-large-2-bold' },
  { id: RoomIconId.HEART, label: 'Семья', iconifyId: 'solar:heart-bold' },
  { id: RoomIconId.STAR, label: 'Избранное', iconifyId: 'solar:star-bold' },
  { id: RoomIconId.CASE, label: 'Работа', iconifyId: 'solar:case-round-bold' },
  { id: RoomIconId.GIFT, label: 'Подарки', iconifyId: 'solar:gift-bold' },
];

export const DEFAULT_ROOM_ICON_ID = RoomIconId.HOME;

export const ROOM_ICON_COLOR_MATCH_COVER = 'match-cover';

export const DEFAULT_ROOM_ICON_COLOR_ID = ROOM_ICON_COLOR_MATCH_COVER;
