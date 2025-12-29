import { useQuery } from '@tanstack/react-query';
import { getPropertyPhotoById } from '@/api/property-photos.api';

export const usePropertyPhotoById = (id: number) => {
  return useQuery({
    queryKey: ['property-photo', id],
    queryFn: () => getPropertyPhotoById(id),
    enabled: !!id,
  });
};

