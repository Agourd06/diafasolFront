import { useQuery } from '@tanstack/react-query';
import { getPropertyPhotosByPropertyId } from '@/api/property-photos.api';

export const usePropertyPhotosByPropertyId = (propertyId: string) => {
  return useQuery({
    queryKey: ['property-photos', 'property', propertyId],
    queryFn: () => getPropertyPhotosByPropertyId(propertyId),
    enabled: !!propertyId,
  });
};

