import { useQuery } from '@tanstack/react-query';
import { searchTaxes } from '@/api/taxes.api';

export const useTaxSearch = (query: string) => {
  return useQuery({
    queryKey: ['taxes', 'search', query],
    queryFn: () => searchTaxes(query),
    enabled: query.length > 0,
  });
};

