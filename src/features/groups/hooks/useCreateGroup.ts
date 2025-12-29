import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGroup } from '@/api/groups.api';
import type { CreateGroupPayload } from '../types';

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateGroupPayload) => createGroup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};
