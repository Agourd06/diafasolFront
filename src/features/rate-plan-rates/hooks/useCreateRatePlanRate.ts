import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRatePlanRate } from '@/api/rate-plan-rates.api';
import type { CreateRatePlanRatePayload } from '../types';

export const useCreateRatePlanRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRatePlanRatePayload) => createRatePlanRate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratePlanRates'] });
    },
  });
};

