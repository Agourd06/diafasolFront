/**
 * React Query hook for searching room types
 */

import { useQuery } from '@tanstack/react-query';
import { searchRoomTypes } from '@/api/room-types.api';

export const useRoomTypeSearch = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['roomTypes', 'search', query],
    queryFn: () => searchRoomTypes(query),
    enabled: enabled && query.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

