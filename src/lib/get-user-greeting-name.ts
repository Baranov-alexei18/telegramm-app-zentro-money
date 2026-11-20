import { UserType } from '@/types/user';

export const getUserGreetingName = (user: UserType | null | undefined): string | null => {
  if (!user) {
    return null;
  }

  const firstName = user.firstName?.trim();
  if (firstName) {
    return firstName;
  }

  const username = user.username?.trim();
  if (username) {
    return username;
  }

  const emailPrefix = user.email?.split('@')[0]?.trim();
  if (emailPrefix) {
    return emailPrefix;
  }

  return null;
};
