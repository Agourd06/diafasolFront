import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRatePlanOption } from '@/api/rate-plan-options.api';
import type { UpdateRatePlanOptionPayload } from '../types';

export const useUpdateRatePlanOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateRatePlanOptionPayload }) =>
      updateRatePlanOption(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratePlanOptions'] });
    },
  });
};

