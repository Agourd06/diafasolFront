import { useQuery } from '@tanstack/react-query';
import { getTaxApplicableDateRanges } from '@/api/tax-applicable-date-ranges.api';
import type { TaxApplicableDateRangeQueryParams } from '../types';

export const useTaxApplicableDateRanges = (params?: TaxApplicableDateRangeQueryParams) => {
  return useQuery({
    queryKey: ['taxApplicableDateRanges', params],
    queryFn: () => getTaxApplicableDateRanges(params),
  });
};

