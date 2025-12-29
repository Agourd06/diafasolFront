import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePropertySettings } from '@/api/property-settings.api';
import type { UpdatePropertySettingsPayload } from '../types';

export const useUpdatePropertySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, payload }: { propertyId: string; payload: UpdatePropertySettingsPayload }) =>
      updatePropertySettings(propertyId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property-settings'] });
      queryClient.invalidateQueries({ queryKey: ['property-settings', variables.propertyId] });
      // Invalidate Channex property query so next sync includes updated settings
      queryClient.invalidateQueries({ queryKey: ['channex-property', variables.propertyId] });
    },
  });
};

