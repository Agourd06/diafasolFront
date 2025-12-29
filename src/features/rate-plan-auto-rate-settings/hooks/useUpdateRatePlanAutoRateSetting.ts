import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRatePlanAutoRateSetting } from '@/api/rate-plan-auto-rate-settings.api';
import type { UpdateRatePlanAutoRateSettingPayload } from '../types';

export const useUpdateRatePlanAutoRateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateRatePlanAutoRateSettingPayload }) =>
      updateRatePlanAutoRateSetting(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratePlanAutoRateSettings'] });
    },
  });
};

