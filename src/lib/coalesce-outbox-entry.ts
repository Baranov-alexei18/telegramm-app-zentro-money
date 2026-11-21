import { IncomingOutboxMutationType, OutboxEntryType, OutboxOperation } from '@/types/outbox';
import { SyncStatus, TransactionProps } from '@/types/transaction';

export const coalesceOutboxEntry = (
  existing: OutboxEntryType | null,
  incoming: IncomingOutboxMutationType
): OutboxEntryType | null => {
  const updatedAt = incoming.updatedAt ?? Date.now();
  const { roomId, transactionId } = incoming;

  if (!existing) {
    if (incoming.op === OutboxOperation.DELETE) {
      return {
        transactionId,
        roomId,
        op: OutboxOperation.DELETE,
        updatedAt,
      };
    }

    return {
      transactionId,
      roomId,
      op: incoming.op,
      payload: {
        ...incoming.payload,
        transactionId,
        roomId,
        syncStatus: SyncStatus.PENDING,
      },
      updatedAt,
    };
  }

  if (existing.op === OutboxOperation.CREATE) {
    if (incoming.op === OutboxOperation.DELETE) {
      return null;
    }

    return {
      transactionId,
      roomId,
      op: OutboxOperation.CREATE,
      payload: {
        ...existing.payload,
        ...incoming.payload,
        transactionId,
        roomId,
        syncStatus: SyncStatus.PENDING,
      },
      updatedAt,
    };
  }

  if (existing.op === OutboxOperation.UPDATE) {
    if (incoming.op === OutboxOperation.DELETE) {
      return {
        transactionId,
        roomId,
        op: OutboxOperation.DELETE,
        updatedAt,
      };
    }

    return {
      transactionId,
      roomId,
      op: OutboxOperation.UPDATE,
      payload: {
        ...existing.payload,
        ...incoming.payload,
        transactionId,
        roomId,
        syncStatus: SyncStatus.PENDING,
      },
      updatedAt,
    };
  }

  // existing.op === OutboxOperation.DELETE
  if (incoming.op === OutboxOperation.DELETE) {
    return {
      transactionId,
      roomId,
      op: OutboxOperation.DELETE,
      updatedAt,
    };
  }

  return {
    transactionId,
    roomId,
    op: incoming.op,
    payload: {
      ...incoming.payload,
      transactionId,
      roomId,
      syncStatus: SyncStatus.PENDING,
    },
    updatedAt,
  };
};

export type RoomOutboxProjectionResultType = {
  transactions: TransactionProps[];
  staleSyncedCreateIds: string[];
};

export const applyOutboxToRoomTransactions = (
  baseTransactions: TransactionProps[],
  roomEntries: OutboxEntryType[]
): RoomOutboxProjectionResultType => {
  if (!roomEntries.length) {
    return {
      transactions: baseTransactions,
      staleSyncedCreateIds: [],
    };
  }

  const syncedServerIds = new Set(
    baseTransactions
      .filter((tx) => tx.syncStatus !== SyncStatus.PENDING)
      .map((tx) => tx.transactionId)
  );

  const deletedIds = new Set<string>();
  const updatedMap = new Map<string, TransactionProps>();
  const createdList: TransactionProps[] = [];
  const staleSyncedCreateIds: string[] = [];

  for (const entry of roomEntries) {
    if (entry.op === OutboxOperation.DELETE) {
      deletedIds.add(entry.transactionId);
      continue;
    }

    if (entry.op === OutboxOperation.UPDATE && entry.payload) {
      updatedMap.set(entry.transactionId, {
        ...entry.payload,
        syncStatus: SyncStatus.PENDING,
      });
      continue;
    }

    if (entry.op === OutboxOperation.CREATE && entry.payload) {
      if (syncedServerIds.has(entry.transactionId)) {
        staleSyncedCreateIds.push(entry.transactionId);
      } else {
        createdList.push({
          ...entry.payload,
          syncStatus: SyncStatus.PENDING,
        });
      }
    }
  }

  const createdMap = new Map(createdList.map((tx) => [tx.transactionId, tx]));
  const seenIds = new Set<string>();
  const projected: TransactionProps[] = [];

  for (const tx of baseTransactions) {
    if (deletedIds.has(tx.transactionId)) {
      continue;
    }

    seenIds.add(tx.transactionId);

    const updatedOverride = updatedMap.get(tx.transactionId);
    if (updatedOverride) {
      projected.push(updatedOverride);
      continue;
    }

    const createdOverride = createdMap.get(tx.transactionId);
    if (createdOverride) {
      projected.push(createdOverride);
      continue;
    }

    projected.push(tx);
  }

  for (const updatedTx of updatedMap.values()) {
    if (!seenIds.has(updatedTx.transactionId) && !deletedIds.has(updatedTx.transactionId)) {
      seenIds.add(updatedTx.transactionId);
      projected.push(updatedTx);
    }
  }

  for (const createdTx of createdList) {
    if (!seenIds.has(createdTx.transactionId) && !deletedIds.has(createdTx.transactionId)) {
      seenIds.add(createdTx.transactionId);
      projected.push(createdTx);
    }
  }

  return {
    transactions: projected,
    staleSyncedCreateIds,
  };
};
