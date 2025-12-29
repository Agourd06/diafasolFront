import { useQuery } from '@tanstack/react-query';
import { getRatePlanDailyRuleById } from '@/api/rate-plan-daily-rules.api';

export const useRatePlanDailyRule = (id: number) => {
  return useQuery({
    queryKey: ['ratePlanDailyRules', id],
    queryFn: () => getRatePlanDailyRuleById(id),
    enabled: !!id,
  });
};

