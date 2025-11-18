import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import { COLLECTION_USER } from '@/constants/db'; // Импортируем название коллекции в Firestore

import { auth, db } from './config'; // Импортируем конфиг Firebase

// Тип данных для обновления
type UpdateUserData = {
  firstName: string;
  lastName: string;
  email: string;
};

export const updateUser = async (userId: string, data: UpdateUserData) => {
  try {
    const user = auth.currentUser;

    if (!user || user.uid !== userId) {
      throw new Error('Невозможно обновить данные пользователя: пользователь не найден');
    }

    await updateProfile(user, {
      displayName: `${data.firstName} ${data.lastName}`,
    });

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
