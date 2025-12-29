import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPropertyContent } from '@/api/property-content.api';
import type { CreatePropertyContentPayload } from '../types';

export const useCreatePropertyContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePropertyContentPayload) => createPropertyContent(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['property-contents'] });
      queryClient.invalidateQueries({ queryKey: ['property-content', data.propertyId] });
      // Invalidate Channex property query so next sync includes new content
      queryClient.invalidateQueries({ queryKey: ['channex-property', data.propertyId] });
    },
  });
};

