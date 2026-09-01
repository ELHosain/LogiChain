// src/services/sync.ts
import { db } from './database';
import { ItemsAPI } from './api';
import { QueuedAction } from '../types';

class SyncService {
  private isSyncing = false;

  async syncPendingActions(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing) return { synced: 0, failed: 0 };
    this.isSyncing = true;

    let synced = 0;
    let failed = 0;

    try {
      const queue = await db.getPendingQueue();
      console.log(`🔄 Synchronisation de ${queue.length} action(s) en attente...`);

      for (const action of queue) {
        try {
          await this.processAction(action);
          await db.markQueueItemSynced(action.id);
          synced++;
        } catch (err) {
          console.error(`❌ Échec sync action ${action.id}:`, err);
          await db.markQueueItemFailed(action.id);
          failed++;
        }
      }
    } finally {
      this.isSyncing = false;
    }

    if (synced > 0) console.log(`✅ ${synced} action(s) synchronisée(s)`);
    return { synced, failed };
  }

  private async processAction(action: QueuedAction): Promise<void> {
    switch (action.type) {
      case 'SCAN_ITEM': {
        const { eventId, itemId, status, version } = action.payload as {
          eventId: string; itemId: string; status: string; version: number;
        };
        await ItemsAPI.scan(eventId, itemId, status, version);
        break;
      }
      case 'CREATE_ANOMALY': {
        // Extend as needed
        console.log('Anomalie à synchroniser:', action.payload);
        break;
      }
      default:
        throw new Error(`Type d'action inconnu: ${action.type}`);
    }
  }
}

export const syncService = new SyncService();
