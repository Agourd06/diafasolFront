import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteRatePlanDailyRule } from '@/api/rate-plan-daily-rules.api';

export const useDeleteRatePlanDailyRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteRatePlanDailyRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratePlanDailyRules'] });
    },
  });
};

