import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTaxSet } from '@/api/tax-sets.api';
import type { UpdateTaxSetPayload } from '../types';

export const useUpdateTaxSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaxSetPayload }) =>
      updateTaxSet(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxSets'] });
    },
  });
};

