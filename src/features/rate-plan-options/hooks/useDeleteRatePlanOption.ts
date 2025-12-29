import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteRatePlanOption } from '@/api/rate-plan-options.api';

export const useDeleteRatePlanOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteRatePlanOption(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratePlanOptions'] });
    },
  });
};

