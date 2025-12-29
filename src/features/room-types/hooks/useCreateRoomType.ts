/**
 * React Query mutation hook for creating a room type
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRoomType } from '@/api/room-types.api';
import type { CreateRoomTypePayload } from '../types';

export const useCreateRoomType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRoomTypePayload) => createRoomType(payload),
    onSuccess: () => {
      // Invalidate and refetch room types list
      queryClient.invalidateQueries({ queryKey: ['roomTypes'] });
    },
  });
};

