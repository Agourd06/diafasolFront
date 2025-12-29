/**
 * React Query hook for fetching room types by property
 */

import { useQuery } from '@tanstack/react-query';
import { getRoomTypesByProperty } from '@/api/room-types.api';

export const useRoomTypesByProperty = (propertyId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['roomTypes', 'property', propertyId],
    queryFn: () => getRoomTypesByProperty(propertyId),
    enabled: enabled && !!propertyId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

