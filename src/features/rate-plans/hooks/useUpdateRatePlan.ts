import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRatePlan } from '@/api/rate-plans.api';
import type { UpdateRatePlanPayload } from '../types';

export const useUpdateRatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRatePlanPayload }) =>
      updateRatePlan(id, payload),
    onSuccess: (_, variables) => {
      // Invalidate all rate plan queries to refresh context and lists
      queryClient.invalidateQueries({ queryKey: ['ratePlans'] });
      // Also invalidate the specific rate plan query used in AppContext
      queryClient.invalidateQueries({ queryKey: ['ratePlans', variables.id] });
      // Invalidate rate plan options as they might have changed
      queryClient.invalidateQueries({ queryKey: ['rate-plan-options', variables.id] });
    },
  });
};

