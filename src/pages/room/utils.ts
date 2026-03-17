import { TransactionProps } from '@/types/transaction';

export const filterMembersByRoom = <T extends { id: string }>(
  members: T[],
  roomMembers: Record<string, unknown>
): T[] => {
  const memberIds = new Set(Object.keys(roomMembers));
  return members.filter((m) => memberIds.has(m.id));
};

export const getLastTransactions = (transactions: TransactionProps[] = []) => {
  const withoutCreatedAt = transactions.filter((t) => !t.createdAt);
  const withCreatedAt = transactions.filter((t) => t.createdAt);

  const sortedWithout = withoutCreatedAt.sort(
    (a, b) => (b.date.seconds || 0) - (a.date.seconds || 0)
  );

  const sortedWith = withCreatedAt.sort(
    (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
  );

  return [...sortedWithout, ...sortedWith].slice(0, 5);
};
