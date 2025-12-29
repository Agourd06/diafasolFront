import { useQuery } from '@tanstack/react-query';
import { getRatePlanById } from '@/api/rate-plans.api';

export const useRatePlan = (id: string) => {
  return useQuery({
    queryKey: ['ratePlans', id],
    queryFn: () => getRatePlanById(id),
    enabled: !!id,
  });
};

