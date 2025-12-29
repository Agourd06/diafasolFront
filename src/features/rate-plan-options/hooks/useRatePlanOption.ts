import { useQuery } from '@tanstack/react-query';
import { getRatePlanOptionById } from '@/api/rate-plan-options.api';

export const useRatePlanOption = (id: number) => {
  return useQuery({
    queryKey: ['ratePlanOptions', id],
    queryFn: () => getRatePlanOptionById(id),
    enabled: !!id,
  });
};

