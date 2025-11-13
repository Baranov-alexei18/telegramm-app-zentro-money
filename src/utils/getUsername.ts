import { UserType } from '@/types/user';

export const getUsername = (user: UserType) => {
  if (!user.firstName?.trim() && !user.lastName?.trim()) {
    return user?.email;
  }

  return `${user?.firstName} ${user?.lastName}`;
};
