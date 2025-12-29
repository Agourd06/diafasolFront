/**
 * React Query mutation hook for updating a room type
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRoomType } from '@/api/room-types.api';
import type { UpdateRoomTypePayload } from '../types';

export const useUpdateRoomType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRoomTypePayload }) =>
      updateRoomType(id, payload),
    onSuccess: (data) => {
      // Invalidate room types list
      queryClient.invalidateQueries({ queryKey: ['roomTypes'] });
      // Invalidate the specific room type
      queryClient.invalidateQueries({ queryKey: ['roomTypes', data.id] });
    },
  });
};

