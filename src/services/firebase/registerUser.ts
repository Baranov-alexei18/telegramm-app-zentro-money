import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { COLLECTION_USER } from '@/constants/db';

import { auth, db } from './config';

type RegisterData = {
  login: string;
  email: string;
  password: string;
};

export const registerUser = async ({ login, email, password }: RegisterData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: login });

    await setDoc(doc(db, COLLECTION_USER, user.uid), {
      id: user.uid,
      username: login,
      firstName: '',
      lastName: '',
      email,
      createdAt: serverTimestamp(),
      telegramId: null,
    });

    return user;
  } catch (error: any) {
    let message = 'Ошибка регистрации';

    if (error.code === 'auth/email-already-in-use') {
      message = 'Пользователь с таким email уже существует';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Неверный email';
    } else if (error.code === 'auth/weak-password') {
      message = 'Пароль слишком слабый';
    }

    throw new Error(message);
  }
};
