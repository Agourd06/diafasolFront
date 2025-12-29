import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRatePlanAutoRateSetting } from '@/api/rate-plan-auto-rate-settings.api';
import type { CreateRatePlanAutoRateSettingPayload } from '../types';

export const useCreateRatePlanAutoRateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRatePlanAutoRateSettingPayload) => createRatePlanAutoRateSetting(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratePlanAutoRateSettings'] });
    },
  });
};

