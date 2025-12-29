import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTax } from '@/api/taxes.api';
import type { CreateTaxPayload } from '../types';

export const useCreateTax = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaxPayload) => createTax(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
    },
  });
};

