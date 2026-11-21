import {
  OutboxEntryType,
  OutboxOperation,
  OutboxStoragePortType,
  RemoteTransactionGatewayType,
} from '@/types/outbox';

export const DEFAULT_OUTBOX_TIMEOUT_MS = 6000;

export type OutboxFlusherType = {
  requestFlush: () => Promise<string[]>;
};

type CreateOutboxFlusherParams = {
  storage: OutboxStoragePortType;
  gateway: RemoteTransactionGatewayType;
  requestTimeoutMs?: number;
  isOnline?: () => boolean;
  onEntrySynced?: (entry: OutboxEntryType) => void;
};

const defaultIsOnline = (): boolean => (typeof navigator === 'undefined' ? true : navigator.onLine);

export const withRequestTimeout = <T>(
  operation: () => Promise<T>,
  timeoutMs: number
): Promise<T> => {
  if (timeoutMs <= 0) {
    return operation();
  }

  let timerId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timerId = setTimeout(() => {
      reject(new Error(`Превышено время ожидания синхронизации (${timeoutMs} мс)`));
    }, timeoutMs);
  });

  return Promise.race([operation(), timeoutPromise]).finally(() => {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
  });
};

const dispatchOutboxEntry = async (
  gateway: RemoteTransactionGatewayType,
  entry: OutboxEntryType
): Promise<void> => {
  if (entry.op === OutboxOperation.DELETE) {
    await gateway.remove(entry.roomId, entry.transactionId);
    return;
  }

  if (!entry.payload) {
    return;
  }

  if (entry.op === OutboxOperation.CREATE) {
    await gateway.create(entry.roomId, entry.payload);
    return;
  }

  await gateway.update(entry.roomId, entry.payload);
};

export const createOutboxFlusher = ({
  storage,
  gateway,
  requestTimeoutMs = DEFAULT_OUTBOX_TIMEOUT_MS,
  isOnline = defaultIsOnline,
  onEntrySynced,
}: CreateOutboxFlusherParams): OutboxFlusherType => {
  let activeFlushPromise: Promise<string[]> | null = null;
  let hasQueuedPass = false;

  const executeFlushLoop = async (): Promise<string[]> => {
    const syncedIds: string[] = [];

    do {
      hasQueuedPass = false;

      if (!isOnline()) {
        break;
      }

      const entries = await storage.getAll();
      if (!entries.length) {
        break;
      }

      for (const entry of entries) {
        if (!isOnline()) {
          hasQueuedPass = false;
          break;
        }

        try {
          await withRequestTimeout(() => dispatchOutboxEntry(gateway, entry), requestTimeoutMs);

          const latestInStorage = await storage.getById(entry.transactionId);

          if (latestInStorage && latestInStorage.updatedAt === entry.updatedAt) {
            await storage.remove(entry.transactionId);
            syncedIds.push(entry.transactionId);
            onEntrySynced?.(entry);
          } else if (latestInStorage) {
            hasQueuedPass = true;
          }
        } catch (error) {
          console.warn('Синхронизация отложена до восстановления стабильной сети:', error);
          hasQueuedPass = false;
          break;
        }
      }
    } while (hasQueuedPass && isOnline());

    return syncedIds;
  };

  return {
    requestFlush: () => {
      if (!isOnline()) {
        return Promise.resolve([]);
      }

      if (activeFlushPromise) {
        hasQueuedPass = true;
        return activeFlushPromise;
      }

      activeFlushPromise = executeFlushLoop().finally(() => {
        activeFlushPromise = null;
      });

      return activeFlushPromise;
    },
  };
};
