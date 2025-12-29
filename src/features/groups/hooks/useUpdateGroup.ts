import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateGroup } from '@/api/groups.api';
import type { UpdateGroupPayload } from '../types';

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateGroupPayload }) =>
      updateGroup(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', variables.id] });
    },
  });
};
