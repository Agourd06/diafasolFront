import { useQuery } from '@tanstack/react-query';
import { getRatePlans } from '@/api/rate-plans.api';
import type { RatePlanQueryParams } from '../types';

export const useRatePlans = (params?: RatePlanQueryParams) => {
  return useQuery({
    queryKey: ['ratePlans', params],
    queryFn: () => getRatePlans(params),
  });
};

