import { useQuery } from '@tanstack/react-query';
import { getRatePlanAutoRateSettings } from '@/api/rate-plan-auto-rate-settings.api';
import type { RatePlanAutoRateSettingQueryParams } from '../types';

export const useRatePlanAutoRateSettings = (params?: RatePlanAutoRateSettingQueryParams) => {
  return useQuery({
    queryKey: ['ratePlanAutoRateSettings', params],
    queryFn: () => getRatePlanAutoRateSettings(params),
  });
};

