/**
 * React Query hook for fetching paginated room types
 */

import { useQuery } from '@tanstack/react-query';
import { getRoomTypes } from '@/api/room-types.api';
import type { RoomTypeQueryParams } from '../types';

export const useRoomTypes = (params?: RoomTypeQueryParams) => {
  return useQuery({
    queryKey: ['roomTypes', params],
    queryFn: () => getRoomTypes(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

