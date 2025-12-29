import { useQuery } from '@tanstack/react-query';
import { getTaxApplicableDateRangeById } from '@/api/tax-applicable-date-ranges.api';

export const useTaxApplicableDateRange = (id: number) => {
  return useQuery({
    queryKey: ['taxApplicableDateRanges', id],
    queryFn: () => getTaxApplicableDateRangeById(id),
    enabled: !!id && !isNaN(id),
  });
};

