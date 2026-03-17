import { createTransaction } from '@/services/firebase/createTransaction';

import { getQueuedTransactions, removeQueuedTransaction } from './transaction-queue';

export const syncQueuedTransactions = async () => {
  const queued = await getQueuedTransactions();

  for (const item of queued) {
    try {
      await createTransaction(item.roomId, item.transaction.transactionId, item.transaction);

      await removeQueuedTransaction(item.transaction.transactionId);
    } catch (e) {
      console.error('sync failed', e);
    }
  }
};
