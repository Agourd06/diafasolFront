import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTaxSet } from '@/api/tax-sets.api';
import type { CreateTaxSetPayload } from '../types';

export const useCreateTaxSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaxSetPayload) => createTaxSet(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxSets'] });
    },
  });
};

