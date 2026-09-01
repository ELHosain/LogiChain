// src/services/database.ts
import * as SQLite from 'expo-sqlite';
import { Item, Event, QueuedAction } from '../types';

const DB_NAME = 'logichain.db';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    this.db = await SQLite.openDatabaseAsync(DB_NAME);
    await this.createTables();
    console.log('📦 SQLite initialisé');
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('DB non initialisée');

    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        synced_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        status TEXT NOT NULL,
        version INTEGER NOT NULL,
        data TEXT NOT NULL,
        synced_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS queue (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at TEXT NOT NULL,
        retry_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending'
      );

      CREATE INDEX IF NOT EXISTS idx_items_event ON items(event_id);
      CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
      CREATE INDEX IF NOT EXISTS idx_queue_status ON queue(status);
    `);
  }

  // ── Events ────────────────────────────────────────────────────────
  async saveEvents(events: Event[]): Promise<void> {
    if (!this.db) return;
    const now = new Date().toISOString();
    for (const ev of events) {
      await this.db.runAsync(
        'INSERT OR REPLACE INTO events (id, data, synced_at) VALUES (?, ?, ?)',
        [ev._id, JSON.stringify(ev), now]
      );
    }
  }

  async getEvents(): Promise<Event[]> {
    if (!this.db) return [];
    const rows = await this.db.getAllAsync<{ data: string }>('SELECT data FROM events');
    return rows.map(r => JSON.parse(r.data));
  }

  // ── Items ─────────────────────────────────────────────────────────
  async saveItems(items: Item[]): Promise<void> {
    if (!this.db) return;
    const now = new Date().toISOString();
    for (const item of items) {
      await this.db.runAsync(
        'INSERT OR REPLACE INTO items (id, event_id, status, version, data, synced_at) VALUES (?, ?, ?, ?, ?, ?)',
        [item._id, item.eventId, item.status, item.version, JSON.stringify(item), now]
      );
    }
  }

  async getItemsByEvent(eventId: string): Promise<Item[]> {
    if (!this.db) return [];
    const rows = await this.db.getAllAsync<{ data: string }>(
      'SELECT data FROM items WHERE event_id = ?',
      [eventId]
    );
    return rows.map(r => JSON.parse(r.data));
  }

  async updateItemStatus(itemId: string, status: string, version: number): Promise<void> {
    if (!this.db) return;
    const row = await this.db.getFirstAsync<{ data: string }>(
      'SELECT data FROM items WHERE id = ?', [itemId]
    );
    if (!row) return;
    const item: Item = JSON.parse(row.data);
    item.status = status as Item['status'];
    item.version = version;
    await this.db.runAsync(
      'UPDATE items SET status = ?, version = ?, data = ? WHERE id = ?',
      [status, version, JSON.stringify(item), itemId]
    );
  }

  // ── Offline Queue ─────────────────────────────────────────────────
  async enqueue(action: Omit<QueuedAction, 'retryCount' | 'status'>): Promise<void> {
    if (!this.db) return;
    await this.db.runAsync(
      'INSERT INTO queue (id, type, payload, created_at, retry_count, status) VALUES (?, ?, ?, ?, 0, "pending")',
      [action.id, action.type, JSON.stringify(action.payload), action.createdAt]
    );
  }

  async getPendingQueue(): Promise<QueuedAction[]> {
    if (!this.db) return [];
    const rows = await this.db.getAllAsync<{
      id: string; type: string; payload: string; created_at: string; retry_count: number; status: string;
    }>('SELECT * FROM queue WHERE status = "pending" ORDER BY created_at ASC');
    return rows.map(r => ({
      id: r.id,
      type: r.type as QueuedAction['type'],
      payload: JSON.parse(r.payload),
      createdAt: r.created_at,
      retryCount: r.retry_count,
      status: r.status as QueuedAction['status'],
    }));
  }

  async markQueueItemSynced(id: string): Promise<void> {
    if (!this.db) return;
    await this.db.runAsync('DELETE FROM queue WHERE id = ?', [id]);
  }

  async markQueueItemFailed(id: string): Promise<void> {
    if (!this.db) return;
    await this.db.runAsync(
      'UPDATE queue SET retry_count = retry_count + 1, status = CASE WHEN retry_count >= 2 THEN "failed" ELSE "pending" END WHERE id = ?',
      [id]
    );
  }

  async getQueueCount(): Promise<number> {
    if (!this.db) return 0;
    const row = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM queue WHERE status = "pending"'
    );
    return row?.count ?? 0;
  }
}

export const db = new DatabaseService();
