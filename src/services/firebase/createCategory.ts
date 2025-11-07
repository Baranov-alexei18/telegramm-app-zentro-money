import { arrayUnion, doc, updateDoc } from 'firebase/firestore';

import { COLLECTION_ROOM } from '@/constants/db';
import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { CategoryType } from '@/types/category';

import { db } from './config';

const generateCategoryId = () => `category_${Date.now()}`;
const getRandomColor = () =>
  `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0')}`;

export const createCategory = async (
  roomId: string,
  data: { name: string; type: TRANSACTION_TYPE }
): Promise<CategoryType> => {
  try {
    if (!roomId) throw new Error('roomId не указан');

    const roomRef = doc(db, COLLECTION_ROOM, roomId);

    const category = {
      id: generateCategoryId(),
      color: getRandomColor(),
      ...data,
    };

    await updateDoc(roomRef, {
      categories: arrayUnion(category),
    });

    return category;
  } catch (error) {
    console.error('Ошибка при создании категории:', error);
    throw error;
  }
};
