import { useEffect, useState } from 'react';
import EventSource from 'react-native-sse';
import * as Haptics from 'expo-haptics';
import { API_BASE_URL } from '../services/api';

export interface Alert {
  id: number;
  type: string;
  message: string;
  agent?: string;
  itemName?: string;
  timestamp: string;
}

let globalES: any = null;
let globalEventId: string | null = null;
let lastMessageTime = Date.now();
let seenIds = new Set<number>();
let lastPollId = 0;
let pollInterval: any = null;
const listeners = new Set<(a: Alert) => void>();
const stateListeners = new Set<(c: boolean) => void>();

function pushAlert(data: any) {
  if (data.type === 'connected') return;
  if (data.id && seenIds.has(data.id)) return;
  if (data.id) seenIds.add(data.id);
  const alert: Alert = { ...data, id: data.id || Date.now() + Math.random() };
  listeners.forEach(fn => fn(alert));
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}

function connectSSE(eventId: string) {
  if (globalES && globalEventId === eventId) return;
  if (globalES) { try { globalES.close(); } catch {} globalES = null; }
  globalEventId = eventId;
  seenIds = new Set();

  const url = `${API_BASE_URL.replace('/api/v1', '')}/api/v1/events/${eventId}/alerts`;
  const es = new EventSource(url);

  es.addEventListener('open', () => { stateListeners.forEach(fn => fn(true)); });
  es.addEventListener('message', (e: any) => {
    lastMessageTime = Date.now();
    stateListeners.forEach(fn => fn(true));
    try { pushAlert(JSON.parse(e.data)); } catch {}
  });
  es.addEventListener('error', () => {
    if (Date.now() - lastMessageTime > 30000) stateListeners.forEach(fn => fn(false));
  });
  globalES = es;
}

function startPolling(eventId: string) {
  if (pollInterval) clearInterval(pollInterval);
  pollInterval = setInterval(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/events/${eventId}/alerts-poll?since=${lastPollId}`);
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        stateListeners.forEach(fn => fn(true));
        lastMessageTime = Date.now();
        for (const a of json.data.slice().reverse()) {
          if (a.id > lastPollId) lastPollId = a.id;
          pushAlert(a);
        }
      }
    } catch {}
  }, 4000);
}

export function useAlerts(eventId: string | null) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    const onAlert = (a: Alert) => setAlerts(prev => [a, ...prev].slice(0, 50));
    const onState = (c: boolean) => setConnected(c);
    listeners.add(onAlert);
    stateListeners.add(onState);

        (async () => {
          try {
            const res = await fetch(`${API_BASE_URL}/events/${eventId}/alerts-poll`);
            const json = await res.json();
            if (json.data?.length > 0) {
              // Charger l'historique existant (alertes des autres comptes incluses)
              const history = json.data
                .slice()
                .sort((a: Alert, b: Alert) => b.id - a.id)   // plus récent en premier
                .slice(0, 50);
              history.forEach((a: Alert) => seenIds.add(a.id));
              setAlerts(history);
              lastPollId = Math.max(...json.data.map((a: Alert) => a.id));
            }
          } catch {}
        })();

    connectSSE(eventId);
    startPolling(eventId);

    const keepAlive = setInterval(() => {
      if (Date.now() - lastMessageTime < 25000) setConnected(true);
    }, 5000);

    return () => {
      listeners.delete(onAlert);
      stateListeners.delete(onState);
      clearInterval(keepAlive);
    };
  }, [eventId]);

  return { alerts, connected, clearAlerts: () => setAlerts([]) };
}
