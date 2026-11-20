import { RoomType } from '@/types/room';

export const mergeRoomPreservingTransactions = (
  currentRoom: RoomType | null,
  incomingRoom: RoomType | null
): RoomType | null => {
  if (!incomingRoom) {
    return null;
  }

  if (!currentRoom || currentRoom.roomId !== incomingRoom.roomId) {
    return incomingRoom;
  }

  const hasIncomingTransactions = Boolean(incomingRoom.transactions?.length);
  const preservedTransactions = hasIncomingTransactions
    ? incomingRoom.transactions
    : (currentRoom.transactions ?? incomingRoom.transactions);

  return {
    ...incomingRoom,
    transactions: preservedTransactions,
  };
};

export const syncRoomInList = (rooms: RoomType[], updatedRoom: RoomType | null): RoomType[] => {
  if (!updatedRoom) {
    return rooms;
  }

  return rooms.map((item) =>
    item.roomId === updatedRoom.roomId
      ? (mergeRoomPreservingTransactions(item, updatedRoom) ?? item)
      : item
  );
};
