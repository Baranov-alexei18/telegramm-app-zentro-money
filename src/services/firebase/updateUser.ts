import { doc, setDoc } from 'firebase/firestore';

import { COLLECTION_USER } from '@/constants/db';
import { UpdateUserType } from '@/types/user';

import { db } from './config';

export const updateUser = async (userId: string, data: UpdateUserType) => {
  try {
    await setDoc(
      doc(db, COLLECTION_USER, userId),
      {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      },
      { merge: true }
    );

    return { success: true };
  } catch (error: any) {
    console.error('Ошибка при обновлении данных пользователя:', error);
    throw new Error('Не удалось обновить данные пользователя');
  }
};
