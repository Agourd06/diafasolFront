/**
 * React Query mutation hook for deleting a room type
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteRoomType } from '@/api/room-types.api';

export const useDeleteRoomType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRoomType(id),
    onSuccess: () => {
      // Invalidate room types list
      queryClient.invalidateQueries({ queryKey: ['roomTypes'] });
    },
  });
};

