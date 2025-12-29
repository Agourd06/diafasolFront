import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRatePlanPeriodRule } from '@/api/rate-plan-period-rules.api';
import type { UpdateRatePlanPeriodRulePayload } from '../types';

export const useUpdateRatePlanPeriodRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateRatePlanPeriodRulePayload }) =>
      updateRatePlanPeriodRule(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratePlanPeriodRules'] });
    },
  });
};

