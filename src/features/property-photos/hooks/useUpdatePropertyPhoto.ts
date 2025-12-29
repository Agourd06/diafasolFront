import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePropertyPhoto } from '@/api/property-photos.api';
import type { UpdatePropertyPhotoPayload } from '../types';

export const useUpdatePropertyPhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePropertyPhotoPayload }) =>
      updatePropertyPhoto(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property-photos'] });
      queryClient.invalidateQueries({ queryKey: ['property-photo', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['property-photos', 'property', data.propertyId] });
      // Invalidate Channex property query so next sync includes updated photo
      queryClient.invalidateQueries({ queryKey: ['channex-property', data.propertyId] });
    },
  });
};

