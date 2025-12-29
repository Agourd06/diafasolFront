import { useQuery } from '@tanstack/react-query';
import { getRatePlansByRoomType } from '@/api/rate-plans.api';

export const useRatePlansByRoomType = (roomTypeId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['ratePlans', 'roomType', roomTypeId],
    queryFn: () => getRatePlansByRoomType(roomTypeId),
    enabled: enabled && !!roomTypeId,
  });
};

