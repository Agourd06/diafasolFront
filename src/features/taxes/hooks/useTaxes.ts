import { useQuery } from '@tanstack/react-query';
import { getTaxes } from '@/api/taxes.api';
import type { TaxQueryParams } from '../types';

export const useTaxes = (params?: TaxQueryParams) => {
  return useQuery({
    queryKey: ['taxes', params],
    queryFn: () => getTaxes(params),
  });
};

