import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteRatePlanAutoRateSetting } from '@/api/rate-plan-auto-rate-settings.api';

export const useDeleteRatePlanAutoRateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteRatePlanAutoRateSetting(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratePlanAutoRateSettings'] });
    },
  });
};

