import { useEffect } from 'react';
import { useParams } from 'react-router';

import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';

export const useLoadRoom = () => {
  const { user } = useUserStore();
  const {
    room,
    loadedTransactionsRoomId,
    setRoom,
    fetchUserRooms,
    fetchTransactions,
    hydrateTransactionsFromQueue,
  } = useRoomStore();

  const params = useParams<{ id: string }>();

  useEffect(() => {
    const fetchRoomData = async () => {
      const targetRoomId = params.id;
      if (!user?.id || !targetRoomId) return;

      try {
        let activeRoom = room?.roomId === targetRoomId ? room : null;

        if (!activeRoom) {
          const rooms = await fetchUserRooms(user.id);
          activeRoom = rooms.find((item) => item.roomId === targetRoomId) ?? null;

          if (!activeRoom?.roomId) return;

          setRoom(activeRoom);
        }

        if (loadedTransactionsRoomId !== targetRoomId) {
          await fetchTransactions(targetRoomId);
          await hydrateTransactionsFromQueue();
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchRoomData();
  }, [
    fetchTransactions,
    fetchUserRooms,
    hydrateTransactionsFromQueue,
    loadedTransactionsRoomId,
    params.id,
    room,
    setRoom,
    user?.id,
  ]);

  return {
    room,
  };
};
