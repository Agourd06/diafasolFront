import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTaxApplicableDateRange } from '@/api/tax-applicable-date-ranges.api';
import type { UpdateTaxApplicableDateRangePayload } from '../types';

export const useUpdateTaxApplicableDateRange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateTaxApplicableDateRangePayload }) =>
      updateTaxApplicableDateRange(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxApplicableDateRanges'] });
    },
  });
};

