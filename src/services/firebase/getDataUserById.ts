import { doc, getDoc } from 'firebase/firestore';

import { COLLECTION_USER } from '@/constants/db';
import { UserType } from '@/types/user';

import { db } from './config';

export const getDataUserById = async (userId: string): Promise<UserType | null> => {
  const docRef = doc(db, COLLECTION_USER, userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data() as UserType;

  return data;
};
