import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTaxSet } from '@/api/tax-sets.api';

export const useDeleteTaxSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTaxSet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxSets'] });
    },
  });
};

