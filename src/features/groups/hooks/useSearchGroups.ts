import { useQuery } from '@tanstack/react-query';
import { searchGroups } from '@/api/groups.api';

export const useSearchGroups = (searchTerm: string) => {
  return useQuery({
    queryKey: ['groups', 'search', searchTerm],
    queryFn: () => searchGroups(searchTerm),
    enabled: searchTerm.length > 0,
  });
};
