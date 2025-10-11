import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { COLLECTION_USER } from '@/constants/db';
import { TelegramUser } from '@/types/user';

import { db } from '../firebase/config';

export const syncTelegramUser = async (user: TelegramUser) => {
  const userDocRef = doc(db, COLLECTION_USER, user.id);
  const docSnap = await getDoc(userDocRef);

  if (!docSnap.exists()) {
    await setDoc(userDocRef, {
      id: user.id,
      telegramId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      createdAt: serverTimestamp(),
    });
  }

  return user;
};
