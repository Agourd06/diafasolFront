import { useQuery } from '@tanstack/react-query';
import { searchProperties } from '@/api/properties.api';

export const usePropertySearch = (searchTerm: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['properties', 'search', searchTerm],
    queryFn: () => searchProperties(searchTerm),
    enabled: enabled && searchTerm.length > 0,
  });
};

