import { useQuery } from '@tanstack/react-query';
import { getPropertySettings } from '@/api/property-settings.api';
import type { PropertySettingsQueryParams } from '../types';

export const usePropertySettings = (params?: PropertySettingsQueryParams) => {
  return useQuery({
    queryKey: ['property-settings', params],
    queryFn: () => getPropertySettings(params),
  });
};

