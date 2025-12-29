import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteRatePlanPeriodRule } from '@/api/rate-plan-period-rules.api';

export const useDeleteRatePlanPeriodRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteRatePlanPeriodRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratePlanPeriodRules'] });
    },
  });
};

