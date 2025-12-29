import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTax } from '@/api/taxes.api';

export const useDeleteTax = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTax(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      queryClient.invalidateQueries({ queryKey: ['taxApplicableDateRanges'] });
    },
  });
};

