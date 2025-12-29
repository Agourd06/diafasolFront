import { useQuery } from '@tanstack/react-query';
import { getRatePlanDailyRules } from '@/api/rate-plan-daily-rules.api';
import type { RatePlanDailyRuleQueryParams } from '../types';

export const useRatePlanDailyRules = (params?: RatePlanDailyRuleQueryParams) => {
  return useQuery({
    queryKey: ['ratePlanDailyRules', params],
    queryFn: () => getRatePlanDailyRules(params),
  });
};

