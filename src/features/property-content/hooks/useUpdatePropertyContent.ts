import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePropertyContent } from '@/api/property-content.api';
import type { UpdatePropertyContentPayload } from '../types';

export const useUpdatePropertyContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, payload }: { propertyId: string; payload: UpdatePropertyContentPayload }) =>
      updatePropertyContent(propertyId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property-contents'] });
      queryClient.invalidateQueries({ queryKey: ['property-content', variables.propertyId] });
      // Invalidate Channex property query so next sync includes updated content
      queryClient.invalidateQueries({ queryKey: ['channex-property', variables.propertyId] });
    },
  });
};

