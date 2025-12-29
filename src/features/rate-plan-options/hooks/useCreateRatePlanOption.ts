import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRatePlanOption } from '@/api/rate-plan-options.api';
import type { CreateRatePlanOptionPayload } from '../types';

export const useCreateRatePlanOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRatePlanOptionPayload) => createRatePlanOption(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratePlanOptions'] });
    },
  });
};

