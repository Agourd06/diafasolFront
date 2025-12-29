import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteGroup } from '@/api/groups.api';

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};
