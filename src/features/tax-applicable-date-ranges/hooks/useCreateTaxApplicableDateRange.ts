import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTaxApplicableDateRange } from '@/api/tax-applicable-date-ranges.api';
import type { CreateTaxApplicableDateRangePayload } from '../types';

export const useCreateTaxApplicableDateRange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaxApplicableDateRangePayload) => createTaxApplicableDateRange(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxApplicableDateRanges'] });
    },
  });
};

