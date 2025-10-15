import { signInWithEmailAndPassword } from 'firebase/auth';

import { auth } from './config';

type LoginData = {
  login: string;
  password: string;
};

export const loginUser = async ({ login, password }: LoginData) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, login, password);

    return userCredential.user;
  } catch (error: any) {
    let message = 'Неверно введен email или пароль';

    if (error.code === 'auth/wrong-password') {
      message = 'Неверный пароль';
    } else if (error.code === 'auth/user-not-found') {
      message = 'Пользователь не найден';
    }

    throw new Error(message);
  }
};
