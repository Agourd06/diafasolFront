import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRatePlan } from '@/api/rate-plans.api';
import type { CreateRatePlanPayload } from '../types';

export const useCreateRatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRatePlanPayload) => createRatePlan(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratePlans'] });
    },
  });
};

