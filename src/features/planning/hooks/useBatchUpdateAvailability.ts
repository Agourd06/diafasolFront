/**
 * Hook for batch updating availability
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { batchUpdateAvailability } from '@/api/planning.api';
import type { BatchAvailabilityUpdatePayload } from '@/api/planning.api';

export const useBatchUpdateAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BatchAvailabilityUpdatePayload) =>
      batchUpdateAvailability(payload),
    onSuccess: () => {
      // Invalidate planning queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['planning'] });
      // Also invalidate room type availability queries
      queryClient.invalidateQueries({ queryKey: ['roomTypeAvailability'] });
    },
  });
};

