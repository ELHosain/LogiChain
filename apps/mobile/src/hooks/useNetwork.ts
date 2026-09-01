// src/hooks/useNetwork.ts
import { useEffect } from 'react';
import * as Network from 'expo-network';
import { useNetworkStore, useQueueStore } from '../store';
import { syncService } from '../services/sync';
import { db } from '../services/database';

export function useNetwork() {
  const { setNetworkState, networkState, isOnline } = useNetworkStore();
  const { setPendingCount, setIsSyncing } = useQueueStore();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const check = async () => {
      const state = await Network.getNetworkStateAsync();
      const online = state.isConnected && state.isInternetReachable;
      const prev = networkState;
      setNetworkState(online ? 'online' : 'offline');

      // Came back online → trigger sync
      if (online && prev === 'offline') {
        setIsSyncing(true);
        const result = await syncService.syncPendingActions();
        setIsSyncing(false);
        const count = await db.getQueueCount();
        setPendingCount(count);
        console.log(`Sync terminée: ${result.synced} synced, ${result.failed} failed`);
      }

      const count = await db.getQueueCount();
      setPendingCount(count);
    };

    check();
    interval = setInterval(check, 10000); // check every 10s
    return () => clearInterval(interval);
  }, []);

  return { isOnline: isOnline(), networkState };
}
