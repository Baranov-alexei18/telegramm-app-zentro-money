import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { COLLECTION_USER } from '@/constants/db';
import { GoogleUser } from '@/types/user';

import { db } from '../firebase/config';

export const syncGoogleUser = async (user: GoogleUser) => {
  const userDocRef = doc(db, COLLECTION_USER, user.id);
  const docSnap = await getDoc(userDocRef);

  if (!docSnap.exists()) {
    await setDoc(userDocRef, {
      id: user.id,
      telegramId: null,
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      email: user.email,
      createdAt: serverTimestamp(),
    });
  }

  return user;
};
