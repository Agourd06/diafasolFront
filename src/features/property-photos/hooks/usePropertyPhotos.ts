import { useQuery } from '@tanstack/react-query';
import { getPropertyPhotos } from '@/api/property-photos.api';
import type { PropertyPhotosQueryParams } from '../types';

export const usePropertyPhotos = (params?: PropertyPhotosQueryParams) => {
  return useQuery({
    queryKey: ['property-photos', params],
    queryFn: () => getPropertyPhotos(params),
  });
};

