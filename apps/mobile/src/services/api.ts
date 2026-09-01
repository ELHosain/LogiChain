// src/services/api.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { ApiResponse, DashboardKpi, Event, Item, User } from '../types';

// ⚠️ Émulateur Android Studio : http://10.0.2.2:3000/api/v1
// Téléphone physique WiFi     : http://TON_IP_PC:3000/api/v1
export const API_BASE_URL = 'http://10.0.2.2:3000/api/v1';

const TOKEN_KEY = 'lc_token';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) await SecureStore.deleteItemAsync(TOKEN_KEY);
    return Promise.reject(error);
  }
);

export const saveToken  = (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token);
export const getToken   = () => SecureStore.getItemAsync(TOKEN_KEY);
export const clearToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);

export const AuthAPI = {
  login: async (email: string, password: string) => {
    const res = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', { email, password });
    await saveToken(res.data.data.token);
    return res.data.data;
  },
  me: async (): Promise<User> => (await api.get<ApiResponse<User>>('/auth/me')).data.data,
  logout: async () => clearToken(),
};

export const EventsAPI = {
  getAll:  async (): Promise<Event[]> => (await api.get<ApiResponse<Event[]>>('/events')).data.data,
  getById: async (id: string): Promise<Event> => (await api.get<ApiResponse<Event>>(`/events/${id}`)).data.data,
  create:  async (data: { name: string; startDate: string; endDate: string }): Promise<Event> =>
    (await api.post<ApiResponse<Event>>('/events', data)).data.data,
  update:  async (id: string, data: Partial<Event>): Promise<Event> =>
    (await api.put<ApiResponse<Event>>(`/events/${id}`, data)).data.data,
  remove:  async (id: string) => (await api.delete(`/events/${id}`)).data,
};

export const ItemsAPI = {
  getByEvent: async (eventId: string, status?: string): Promise<Item[]> => {
    const params = status ? { status } : {};
    return (await api.get<ApiResponse<Item[]>>(`/events/${eventId}/items`, { params })).data.data;
  },
  getById: async (eventId: string, itemId: string): Promise<Item> =>
    (await api.get<ApiResponse<Item>>(`/events/${eventId}/items/${itemId}`)).data.data,
  create: async (eventId: string, data: { name: string; category: string; carbonKg: number }): Promise<Item> =>
    (await api.post<ApiResponse<Item>>(`/events/${eventId}/items`, data)).data.data,
  scan: async (eventId: string, itemId: string, status: string, version: number): Promise<Item> =>
    (await api.patch<ApiResponse<Item>>(`/events/${eventId}/items/${itemId}/scan`, { status, version })).data.data,
  remove: async (eventId: string, itemId: string) =>
    (await api.delete(`/events/${eventId}/items/${itemId}`)).data,
};

export const DashboardAPI = {
  getKpi: async (eventId: string): Promise<DashboardKpi> =>
    (await api.get<ApiResponse<DashboardKpi>>(`/events/${eventId}/dashboard`)).data.data,
};

export const AnomaliesAPI = {
  getByEvent: async (eventId: string) =>
    (await api.get<ApiResponse<any[]>>(`/events/${eventId}/anomalies`)).data.data,
  create: async (eventId: string, data: { description: string; itemId?: string; itemName?: string; location?: any }) =>
    (await api.post<ApiResponse<any>>(`/events/${eventId}/anomalies`, data)).data.data,
  resolve: async (eventId: string, anomalyId: string) =>
    (await api.patch<ApiResponse<any>>(`/events/${eventId}/anomalies/${anomalyId}/resolve`, {})).data.data,
  remove: async (eventId: string, anomalyId: string) =>
    (await api.delete(`/events/${eventId}/anomalies/${anomalyId}`)).data,
};

// Role permissions
export const canCreateEvent = (role?: string) => role === 'admin' || role === 'responsable';
export const canEditEvent   = (role?: string) => role === 'admin' || role === 'responsable';
export const canDeleteEvent = (role?: string) => role === 'admin' || role === 'responsable';
export const canCreateItem  = (role?: string) => role === 'admin' || role === 'responsable' || role === 'agent';
export const canScan        = (role?: string) => !!role;

export default api;
