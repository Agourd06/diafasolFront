import { useQuery } from '@tanstack/react-query';
import { getRatePlanRateById } from '@/api/rate-plan-rates.api';

export const useRatePlanRate = (id: number) => {
  return useQuery({
    queryKey: ['ratePlanRates', id],
    queryFn: () => getRatePlanRateById(id),
    enabled: !!id,
  });
};

