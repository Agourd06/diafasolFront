import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRatePlanDailyRule } from '@/api/rate-plan-daily-rules.api';
import type { CreateRatePlanDailyRulePayload } from '../types';

export const useCreateRatePlanDailyRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRatePlanDailyRulePayload) => createRatePlanDailyRule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratePlanDailyRules'] });
    },
  });
};

