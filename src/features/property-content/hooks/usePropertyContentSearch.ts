import { useQuery } from '@tanstack/react-query';
import { searchPropertyContent } from '@/api/property-content.api';

export const usePropertyContentSearch = (searchTerm: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['property-contents', 'search', searchTerm],
    queryFn: () => searchPropertyContent(searchTerm),
    enabled: enabled && searchTerm.length > 0,
  });
};

