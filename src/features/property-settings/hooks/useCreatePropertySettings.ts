import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPropertySettings } from '@/api/property-settings.api';
import type { CreatePropertySettingsPayload } from '../types';

export const useCreatePropertySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePropertySettingsPayload) => createPropertySettings(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['property-settings'] });
      queryClient.invalidateQueries({ queryKey: ['property-settings', data.propertyId] });
      // Invalidate Channex property query so next sync includes new settings
      queryClient.invalidateQueries({ queryKey: ['channex-property', data.propertyId] });
    },
  });
};

