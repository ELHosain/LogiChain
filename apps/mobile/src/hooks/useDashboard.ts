// src/hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { DashboardAPI } from '../services/api';
import { useNetworkStore } from '../store';

export function useDashboard(eventId: string) {
  const { isOnline } = useNetworkStore();
  return useQuery({
    queryKey: ['dashboard', eventId],
    queryFn: () => DashboardAPI.getKpi(eventId),
    enabled: !!eventId && isOnline(),
    staleTime: 60_000,
  });
}
