// src/hooks/useItems.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { ItemsAPI } from '../services/api';
import { db } from '../services/database';
import { useNetworkStore } from '../store';
import { Item, ItemStatus } from '../types';
import { generateId } from '../utils/helpers';

export function useItems(eventId: string) {
  const { isOnline } = useNetworkStore();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading, error, refetch } = useQuery({
    queryKey: ['items', eventId],
    queryFn: async () => {
      if (isOnline()) {
        const data = await ItemsAPI.getByEvent(eventId);
        await db.saveItems(data);
        return data;
      }
      return db.getItemsByEvent(eventId);
    },
    staleTime: 30_000,
  });

  // Scan with Optimistic UI + offline queue
  const scanMutation = useMutation({
    mutationFn: async ({ item, newStatus }: { item: Item; newStatus: ItemStatus }) => {
      if (isOnline()) {
        return ItemsAPI.scan(eventId, item._id, newStatus, item.version);
      } else {
        await db.enqueue({
          id: generateId(),
          type: 'SCAN_ITEM',
          payload: { eventId, itemId: item._id, status: newStatus, version: item.version },
          createdAt: new Date().toISOString(),
        });
        await db.updateItemStatus(item._id, newStatus, item.version);
        return { ...item, status: newStatus, _optimistic: true };
      }
    },
    onMutate: async ({ item, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['items', eventId] });
      const prev = queryClient.getQueryData<Item[]>(['items', eventId]);
      queryClient.setQueryData<Item[]>(['items', eventId], (old = []) =>
        old.map(i => i._id === item._id
          ? { ...i, status: newStatus, _optimistic: true }
          : i
        )
      );
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return { prev };
    },
    onError: (_err, _v, context) => {
      if (context?.prev) queryClient.setQueryData(['items', eventId], context.prev);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['items', eventId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', eventId] });
    },
  });

  // Create item (admin/responsable/agent)
  const createMutation = useMutation({
    mutationFn: (data: { name: string; category: string; carbonKg: number }) =>
      ItemsAPI.create(eventId, data),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['items', eventId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', eventId] });
    },
  });

  return {
    items,
    isLoading,
    error,
    refetch,
    scanItem: scanMutation.mutate,
    isScanning: scanMutation.isPending,
    createItem: createMutation.mutate,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
  };
}
