import { useQuery } from '@tanstack/react-query';
import { searchTaxApplicableDateRanges } from '@/api/tax-applicable-date-ranges.api';

export const useTaxApplicableDateRangeSearch = (query: string) => {
  return useQuery({
    queryKey: ['taxApplicableDateRanges', 'search', query],
    queryFn: () => searchTaxApplicableDateRanges(query),
    enabled: query.length > 0,
  });
};

