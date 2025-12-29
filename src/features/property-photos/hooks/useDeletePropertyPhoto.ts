import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePropertyPhoto, getPropertyPhotoById } from '@/api/property-photos.api';

export const useDeletePropertyPhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      // Get the photo first to get propertyId before deletion
      let propertyId: string | undefined;
      try {
        const photo = await getPropertyPhotoById(id);
        propertyId = photo.propertyId;
      } catch (error) {
        console.warn('Could not fetch photo before deletion:', error);
      }
      await deletePropertyPhoto(id);
      return propertyId;
    },
    onSuccess: (propertyId) => {
      queryClient.invalidateQueries({ queryKey: ['property-photos'] });
      // Invalidate Channex property query so next sync reflects deleted photo
      if (propertyId) {
        queryClient.invalidateQueries({ queryKey: ['channex-property', propertyId] });
      }
    },
  });
};

