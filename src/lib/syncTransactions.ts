import { createTransaction } from '@/services/firebase/createTransaction';

import { getQueuedTransactions, removeQueuedTransaction } from './transaction-queue';

export const syncQueuedTransactions = async () => {
  const queued = await getQueuedTransactions();

  for (const tx of queued) {
    if (!tx.roomId || !tx.transactionId) {
      continue;
    }

    try {
      await createTransaction(tx.roomId, tx.transactionId, tx);

      await removeQueuedTransaction(tx.transactionId);
    } catch (error) {
      console.error('Ошибка синхронизации офлайн-транзакции:', error);
    }
  }
};
