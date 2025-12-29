/**
 * React Query hook for fetching a single room type by ID
 */

import { useQuery } from '@tanstack/react-query';
import { getRoomTypeById } from '@/api/room-types.api';

export const useRoomTypeById = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['roomTypes', id],
    queryFn: () => getRoomTypeById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

