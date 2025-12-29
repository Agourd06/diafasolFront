import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRatePlanDailyRule } from '@/api/rate-plan-daily-rules.api';
import type { UpdateRatePlanDailyRulePayload } from '../types';

export const useUpdateRatePlanDailyRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateRatePlanDailyRulePayload }) =>
      updateRatePlanDailyRule(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratePlanDailyRules'] });
    },
  });
};

