import { useQuery } from '@tanstack/react-query';
import { searchPropertyPhotos } from '@/api/property-photos.api';

export const usePropertyPhotosSearch = (searchTerm: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['property-photos', 'search', searchTerm],
    queryFn: () => searchPropertyPhotos(searchTerm),
    enabled: enabled && searchTerm.length > 0,
  });
};

