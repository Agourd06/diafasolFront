import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteRatePlanRate } from '@/api/rate-plan-rates.api';

export const useDeleteRatePlanRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteRatePlanRate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratePlanRates'] });
    },
  });
};

