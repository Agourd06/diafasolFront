import { useQuery } from '@tanstack/react-query';
import { getRatePlanPeriodRuleById } from '@/api/rate-plan-period-rules.api';

export const useRatePlanPeriodRule = (id: number) => {
  return useQuery({
    queryKey: ['ratePlanPeriodRules', id],
    queryFn: () => getRatePlanPeriodRuleById(id),
    enabled: !!id,
  });
};

