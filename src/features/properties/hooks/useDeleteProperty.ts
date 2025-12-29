import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProperty } from '@/api/properties.api';

export const useDeleteProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
};

