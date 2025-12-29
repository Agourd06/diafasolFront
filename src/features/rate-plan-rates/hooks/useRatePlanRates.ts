import { useQuery } from '@tanstack/react-query';
import { getRatePlanRates } from '@/api/rate-plan-rates.api';
import type { RatePlanRateQueryParams } from '../types';

export const useRatePlanRates = (params?: RatePlanRateQueryParams) => {
  return useQuery({
    queryKey: ['ratePlanRates', params],
    queryFn: () => getRatePlanRates(params),
  });
};

