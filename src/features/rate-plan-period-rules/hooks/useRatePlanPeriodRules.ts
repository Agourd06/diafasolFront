import { useQuery } from '@tanstack/react-query';
import { getRatePlanPeriodRules } from '@/api/rate-plan-period-rules.api';
import type { RatePlanPeriodRuleQueryParams } from '../types';

export const useRatePlanPeriodRules = (params?: RatePlanPeriodRuleQueryParams) => {
  return useQuery({
    queryKey: ['ratePlanPeriodRules', params],
    queryFn: () => getRatePlanPeriodRules(params),
  });
};

