// src/store/index.ts
import { create } from 'zustand';
import { AuthState, NetworkState, QueuedAction, User } from '../types';
import { clearToken } from '../services/api';

// ── Auth Store ────────────────────────────────────────────────────
interface AuthStore extends AuthState {
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
  clearAuth: async () => {
    await clearToken();
    set({ token: null, user: null, isAuthenticated: false });
  },
}));

// ── Network Store ─────────────────────────────────────────────────
interface NetworkStore {
  networkState: NetworkState;
  setNetworkState: (state: NetworkState) => void;
  isOnline: () => boolean;
}

export const useNetworkStore = create<NetworkStore>((set, get) => ({
  networkState: 'unknown',
  setNetworkState: (networkState) => set({ networkState }),
  isOnline: () => get().networkState === 'online',
}));

// ── Queue Store ───────────────────────────────────────────────────
interface QueueStore {
  pendingCount: number;
  isSyncing: boolean;
  setPendingCount: (count: number) => void;
  setIsSyncing: (val: boolean) => void;
}

export const useQueueStore = create<QueueStore>((set) => ({
  pendingCount: 0,
  isSyncing: false,
  setPendingCount: (pendingCount) => set({ pendingCount }),
  setIsSyncing: (isSyncing) => set({ isSyncing }),
}));

// ── Selected Event Store ──────────────────────────────────────────
interface EventStore {
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
}

export const useEventStore = create<EventStore>((set) => ({
  selectedEventId: null,
  setSelectedEventId: (selectedEventId) => set({ selectedEventId }),
}));
