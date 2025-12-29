import { useQuery } from '@tanstack/react-query';
import { getRatePlanAutoRateSettingById } from '@/api/rate-plan-auto-rate-settings.api';

export const useRatePlanAutoRateSetting = (id: number) => {
  return useQuery({
    queryKey: ['ratePlanAutoRateSettings', id],
    queryFn: () => getRatePlanAutoRateSettingById(id),
    enabled: !!id,
  });
};

