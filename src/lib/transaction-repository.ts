import {
  OutboxEntryType,
  OutboxOperation,
  OutboxStoragePortType,
  RemoteTransactionGatewayType,
} from '@/types/outbox';
import { TransactionProps } from '@/types/transaction';

import { applyOutboxToRoomTransactions, coalesceOutboxEntry } from './coalesce-outbox-entry';
import { firestoreTransactionGateway } from './firestore-transaction-gateway';
import { indexedDbOutboxStorage } from './indexeddb-outbox-storage';
import { createOutboxFlusher, DEFAULT_OUTBOX_TIMEOUT_MS } from './outbox-flusher';

export type SyncedListenerType = (entry: OutboxEntryType) => void;

export type TransactionRepositoryType = {
  enqueueCreate: (roomId: string, transaction: TransactionProps) => Promise<void>;
  enqueueUpdate: (roomId: string, transaction: TransactionProps) => Promise<void>;
  enqueueDelete: (roomId: string, transactionId: string) => Promise<void>;
  hydrateRoomTransactions: (
    roomId: string,
    baseTransactions: TransactionProps[]
  ) => Promise<TransactionProps[]>;
  requestFlush: () => Promise<string[]>;
  subscribeSynced: (listener: SyncedListenerType) => () => void;
};

type CreateTransactionRepositoryParams = {
  storage?: OutboxStoragePortType;
  gateway?: RemoteTransactionGatewayType;
  requestTimeoutMs?: number;
  isOnline?: () => boolean;
};

export const createTransactionRepository = ({
  storage = indexedDbOutboxStorage,
  gateway = firestoreTransactionGateway,
  requestTimeoutMs = DEFAULT_OUTBOX_TIMEOUT_MS,
  isOnline,
}: CreateTransactionRepositoryParams = {}): TransactionRepositoryType => {
  const listeners = new Set<SyncedListenerType>();

  const flusher = createOutboxFlusher({
    storage,
    gateway,
    requestTimeoutMs,
    isOnline,
    onEntrySynced: (entry) => {
      listeners.forEach((listener) => listener(entry));
    },
  });

  return {
    enqueueCreate: async (roomId, transaction) => {
      const existing = await storage.getById(transaction.transactionId);
      const nextEntry = coalesceOutboxEntry(existing, {
        op: OutboxOperation.CREATE,
        roomId,
        transactionId: transaction.transactionId,
        payload: transaction,
      });

      if (nextEntry) {
        await storage.put(nextEntry);
        void flusher.requestFlush();
      }
    },

    enqueueUpdate: async (roomId, transaction) => {
      const existing = await storage.getById(transaction.transactionId);
      const nextEntry = coalesceOutboxEntry(existing, {
        op: OutboxOperation.UPDATE,
        roomId,
        transactionId: transaction.transactionId,
        payload: transaction,
      });

      if (nextEntry) {
        await storage.put(nextEntry);
        void flusher.requestFlush();
      }
    },

    enqueueDelete: async (roomId, transactionId) => {
      const existing = await storage.getById(transactionId);
      const nextEntry = coalesceOutboxEntry(existing, {
        op: OutboxOperation.DELETE,
        roomId,
        transactionId,
      });

      if (nextEntry === null) {
        await storage.remove(transactionId);
        return;
      }

      await storage.put(nextEntry);
      void flusher.requestFlush();
    },

    hydrateRoomTransactions: async (roomId, baseTransactions) => {
      const roomEntries = await storage.getByRoom(roomId);
      if (!roomEntries.length) {
        return baseTransactions;
      }

      const { transactions, staleSyncedCreateIds } = applyOutboxToRoomTransactions(
        baseTransactions,
        roomEntries
      );

      if (staleSyncedCreateIds.length) {
        await Promise.allSettled(staleSyncedCreateIds.map((id) => storage.remove(id)));
      }

      return transactions;
    },

    requestFlush: () => flusher.requestFlush(),

    subscribeSynced: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
};

export const transactionRepository = createTransactionRepository();
