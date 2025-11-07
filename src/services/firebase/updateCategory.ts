import { doc, updateDoc } from 'firebase/firestore';

import { COLLECTION_ROOM } from '@/constants/db';
import { CategoryType } from '@/types/category';

import { db } from './config';

export const updateCategory = async (
  roomId: string,
  categories: CategoryType[],
  data: CategoryType
): Promise<CategoryType[]> => {
  try {
    if (!roomId) throw new Error('roomId не указан');

    const roomRef = doc(db, COLLECTION_ROOM, roomId);

    const updatedCategories =
      categories.map((cat) => (cat.id === data.id ? { ...cat, ...data } : cat)) || [];

    await updateDoc(roomRef, { categories: updatedCategories });

    return updatedCategories;
  } catch (error) {
    console.error('Ошибка при обновлении категории:', error);
    throw error;
  }
};
