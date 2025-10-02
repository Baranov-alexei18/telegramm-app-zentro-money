import bcrypt from 'bcryptjs';

export async function checkPassword(plainPassword: string, hashedPassword: string) {
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);

  if (!isMatch) {
    throw new Error('Неверный пароль');
  }

  return true;
}
