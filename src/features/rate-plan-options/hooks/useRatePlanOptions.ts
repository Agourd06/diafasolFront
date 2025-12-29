import { useQuery } from '@tanstack/react-query';
import { getRatePlanOptions } from '@/api/rate-plan-options.api';
import type { RatePlanOptionQueryParams } from '../types';

export const useRatePlanOptions = (params?: RatePlanOptionQueryParams) => {
  return useQuery({
    queryKey: ['ratePlanOptions', params],
    queryFn: () => getRatePlanOptions(params),
  });
};

