import { useQuery } from '@tanstack/react-query';
import { getDateRangesByTax } from '@/api/tax-applicable-date-ranges.api';

export const useDateRangesByTax = (taxId: string) => {
  return useQuery({
    queryKey: ['taxApplicableDateRanges', 'tax', taxId],
    queryFn: () => getDateRangesByTax(taxId),
    enabled: !!taxId,
  });
};

