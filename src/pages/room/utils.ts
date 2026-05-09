import { TransactionProps } from '@/types/transaction';

export const filterMembersByRoom = <T extends { id: string }>(
  members: T[],
  roomMembers: Record<string, unknown>
): T[] => {
  const memberIds = new Set(Object.keys(roomMembers));
  return members.filter((m) => memberIds.has(m.id));
};

export const getLastTransactions = (transactions: TransactionProps[] = []) => {
  const sortedWithout = transactions.sort((a, b) => (b.date.seconds || 0) - (a.date.seconds || 0));

  return sortedWithout.slice(0, 5);
};
