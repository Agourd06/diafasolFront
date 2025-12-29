import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRatePlanRate } from '@/api/rate-plan-rates.api';
import type { UpdateRatePlanRatePayload } from '../types';

export const useUpdateRatePlanRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateRatePlanRatePayload }) =>
      updateRatePlanRate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratePlanRates'] });
    },
  });
};

