import { useQuery } from '@tanstack/react-query';
import { searchRatePlans } from '@/api/rate-plans.api';

export const useRatePlanSearch = (searchTerm: string) => {
  return useQuery({
    queryKey: ['ratePlans', 'search', searchTerm],
    queryFn: () => searchRatePlans(searchTerm),
    enabled: searchTerm.length > 0,
  });
};

