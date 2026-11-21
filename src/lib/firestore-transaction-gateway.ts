import { createTransaction } from '@/services/firebase/createTransaction';
import { deleteTransactionById } from '@/services/firebase/deleteTransactionById';
import { updateTransaction } from '@/services/firebase/updateTransaction';
import { RemoteTransactionGatewayType } from '@/types/outbox';
import { TransactionProps } from '@/types/transaction';

import { normalizeTransactionTimestamps } from './restore-timestamp';

const prepareFirestorePayload = (
  roomId: string,
  transaction: TransactionProps
): TransactionProps => {
  const normalized = normalizeTransactionTimestamps({
    ...transaction,
    roomId: transaction.roomId || roomId,
  });

  const cleanPayload = { ...normalized };
  delete cleanPayload.syncStatus;

  return cleanPayload;
};

export const createFirestoreTransactionGateway = (): RemoteTransactionGatewayType => ({
  create: async (roomId, transaction) => {
    const cleanPayload = prepareFirestorePayload(roomId, transaction);
    await createTransaction(roomId, cleanPayload.transactionId, cleanPayload);
  },

  update: async (roomId, transaction) => {
    const cleanPayload = prepareFirestorePayload(roomId, transaction);
    await updateTransaction(roomId, cleanPayload.transactionId, cleanPayload);
  },

  remove: async (roomId, transactionId) => {
    await deleteTransactionById(roomId, transactionId);
  },
});

export const firestoreTransactionGateway = createFirestoreTransactionGateway();
