import { doc, updateDoc } from 'firebase/firestore';

import { COLLECTION_ROOM } from '@/constants/db';
import { CategoryType } from '@/types/category';

import { db } from './config';

export const deleteCategoryById = async (
  roomId: string,
  categories: CategoryType[],
  categoryId: string
) => {
  try {
    if (!roomId) throw new Error('roomId не указан');

    const roomRef = doc(db, COLLECTION_ROOM, roomId);

    const updatedCategories = categories.filter((cat) => cat.id !== categoryId) || [];

    await updateDoc(roomRef, { categories: updatedCategories });

    return updatedCategories;
  } catch (error) {
    console.error('Ошибка при удалении категории:', error);
    throw error;
  }
};
