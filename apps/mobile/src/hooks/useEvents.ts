// src/hooks/useEvents.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EventsAPI } from '../services/api';
import { db } from '../services/database';
import { useNetworkStore } from '../store';

export function useEvents() {
  const { isOnline } = useNetworkStore();

  const query = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      if (isOnline()) {
        const data = await EventsAPI.getAll();
        await db.saveEvents(data);
        return data;
      }
      return db.getEvents();
    },
  });

  return query;
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: EventsAPI.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => EventsAPI.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}
