import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPropertyPhoto } from '@/api/property-photos.api';
import type { CreatePropertyPhotoPayload } from '../types';

export const useCreatePropertyPhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePropertyPhotoPayload) => createPropertyPhoto(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['property-photos'] });
      queryClient.invalidateQueries({ queryKey: ['property-photos', 'property', data.propertyId] });
      // Invalidate Channex property query so next sync includes new photo
      queryClient.invalidateQueries({ queryKey: ['channex-property', data.propertyId] });
    },
  });
};

