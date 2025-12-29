import { useQuery } from '@tanstack/react-query';
import { getTaxSets } from '@/api/tax-sets.api';
import type { TaxSetQueryParams } from '../types';

export const useTaxSets = (params?: TaxSetQueryParams) => {
  return useQuery({
    queryKey: ['taxSets', params],
    queryFn: () => getTaxSets(params),
  });
};

