import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRatePlanPeriodRule } from '@/api/rate-plan-period-rules.api';
import type { CreateRatePlanPeriodRulePayload } from '../types';

export const useCreateRatePlanPeriodRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRatePlanPeriodRulePayload) => createRatePlanPeriodRule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratePlanPeriodRules'] });
    },
  });
};

