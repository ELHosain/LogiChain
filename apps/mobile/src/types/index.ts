// src/types/index.ts

// ── Auth ──────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'responsable' | 'agent' | 'prestataire';
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

// ── Event ─────────────────────────────────────────────────────────
export interface Zone {
  zoneId: string;
  name: string;
  location: GeoJSONPolygon;
}

export interface Event {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  zones: Zone[];
  carbonFootprint: number;
  createdAt: string;
  updatedAt: string;
}

// ── Item ──────────────────────────────────────────────────────────
export type ItemStatus = 'stocké' | 'en_transit' | 'livré' | 'en_maintenance' | 'archivé';
export type ItemCategory = 'energie' | 'scene' | 'son' | 'lumiere' | 'securite' | 'sanitaire' | 'autre';

export interface HistoryEntry {
  status: ItemStatus;
  agentId: string;
  note: string;
  timestamp: string;
}

export interface Item {
  _id: string;
  name: string;
  category: ItemCategory;
  eventId: string;
  assignedZone: string | null;
  location: GeoJSONPoint | null;
  carbonKg: number;
  status: ItemStatus;
  history: HistoryEntry[];
  version: number;
  createdAt: string;
  updatedAt: string;
  // Optimistic UI flag
  _optimistic?: boolean;
  _optimisticStatus?: ItemStatus;
}

// ── Dashboard KPI ─────────────────────────────────────────────────
export interface CarbonCategory {
  _id: string;
  totalCarbon: number;
  count: number;
}

export interface StockSummary {
  _id: ItemStatus;
  count: number;
}

export interface DashboardKpi {
  totalCarbon: number;
  carbonByCategory: CarbonCategory[];
  stock: StockSummary[];
  totalItems: number;
  bottleneck: number;
}

// ── GeoJSON ───────────────────────────────────────────────────────
export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

// ── Offline queue ─────────────────────────────────────────────────
export type QueueActionType = 'SCAN_ITEM' | 'CREATE_ANOMALY';

export interface QueuedAction {
  id: string;
  type: QueueActionType;
  payload: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
}

// ── API responses ─────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
}

export interface ApiError {
  error: string;
}

// ── Network ───────────────────────────────────────────────────────
export type NetworkState = 'online' | 'offline' | 'unknown';
