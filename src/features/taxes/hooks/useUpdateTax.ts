import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTax } from '@/api/taxes.api';
import type { UpdateTaxPayload } from '../types';

export const useUpdateTax = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaxPayload }) =>
      updateTax(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
    },
  });
};

