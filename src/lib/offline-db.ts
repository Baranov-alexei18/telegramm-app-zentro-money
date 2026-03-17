import { openDB } from 'idb';

import { INDEX_DB_NAME, SUB_COLLECTION_TRANSACTIONS } from '@/constants/db';

export const dbPromise = openDB(INDEX_DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(SUB_COLLECTION_TRANSACTIONS)) {
      db.createObjectStore(SUB_COLLECTION_TRANSACTIONS, {
        keyPath: 'transactionId',
      });
    }
  },
});
