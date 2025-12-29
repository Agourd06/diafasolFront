import { useQuery } from '@tanstack/react-query';
import { getEvents, getEventMessageById, type GetEventsParams } from '@/api/event-messages.api';
import type { EventMessage } from '../types';

export const useEvents = (params?: GetEventsParams) => {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => getEvents(params),
  });
};

export const useEvent = (id: string | null) => {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => getEventMessageById(id!),
    enabled: !!id,
  });
};

