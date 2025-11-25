import { useEffect } from 'react';
import { useParams } from 'react-router';

import { getUserRooms } from '@/services/firebase/getUserRooms';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';

export const useLoadRoom = () => {
  const { user } = useUserStore();
  const { room, setRoom, fetchTransactions } = useRoomStore();

  const params = useParams<{ id: string }>();

  useEffect(() => {
    const fetchRoomData = async () => {
      if (!user || room?.roomId === params.id) return;

      try {
        const rooms = await getUserRooms(user.id);
        const currentRoom = rooms.find((r) => r.roomId === params.id);

        if (!currentRoom?.roomId) return;

        fetchTransactions(currentRoom.roomId);
        setRoom(currentRoom);
      } catch (error) {
        console.error(error);
      }
    };

    fetchRoomData();
  }, [user, room?.roomId, params.id, setRoom, fetchTransactions]);

  return {
    room,
  };
};
