import { useEffect, useRef, useState } from 'react';

import { syncQueuedTransactions } from '@/lib/syncTransactions';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const isSyncingRef = useRef(false);

  const runSync = async () => {
    if (isSyncingRef.current) return;

    try {
      isSyncingRef.current = true;
      await syncQueuedTransactions();
    } finally {
      isSyncingRef.current = false;
    }
  };

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);

      await runSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.onLine) {
      runSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
