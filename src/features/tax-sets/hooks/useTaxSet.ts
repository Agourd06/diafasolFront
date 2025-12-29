import { useQuery } from '@tanstack/react-query';
import { getTaxSetById } from '@/api/tax-sets.api';

export const useTaxSet = (id: string) => {
  return useQuery({
    queryKey: ['taxSets', id],
    queryFn: () => getTaxSetById(id),
    enabled: !!id,
  });
};

