import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteRatePlan } from '@/api/rate-plans.api';

export const useDeleteRatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRatePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratePlans'] });
    },
  });
};

