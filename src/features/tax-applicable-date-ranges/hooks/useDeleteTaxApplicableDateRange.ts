import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTaxApplicableDateRange } from '@/api/tax-applicable-date-ranges.api';

export const useDeleteTaxApplicableDateRange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTaxApplicableDateRange(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxApplicableDateRanges'] });
    },
  });
};

