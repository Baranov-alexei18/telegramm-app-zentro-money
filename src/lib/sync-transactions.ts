import { createTransaction } from '@/services/firebase/createTransaction';

import { getQueuedTransactions, removeQueuedTransaction } from './transaction-queue';

type SyncQueuedTransactionsOptions = {
  onTransactionSynced?: (transactionId: string) => void;
};

export const syncQueuedTransactions = async (
  options?: SyncQueuedTransactionsOptions
): Promise<string[]> => {
  const queued = await getQueuedTransactions();
  const syncedIds: string[] = [];

  for (const tx of queued) {
    if (!tx.roomId || !tx.transactionId) {
      continue;
    }

    try {
      const payload = { ...tx };
      delete payload.syncStatus;

      await createTransaction(tx.roomId, tx.transactionId, payload);
      await removeQueuedTransaction(tx.transactionId);

      syncedIds.push(tx.transactionId);
      options?.onTransactionSynced?.(tx.transactionId);
    } catch (error) {
      console.error('Ошибка синхронизации офлайн-транзакции:', error);
    }
  }

  return syncedIds;
};
