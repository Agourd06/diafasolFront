/**
 * Hook for batch updating rates
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { batchUpdateRates } from '@/api/planning.api';
import type { BatchRateUpdatePayload } from '@/api/planning.api';

export const useBatchUpdateRates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BatchRateUpdatePayload) =>
      batchUpdateRates(payload),
    onSuccess: () => {
      // Invalidate planning queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['planning'] });
      // Also invalidate rate plan rates queries
      queryClient.invalidateQueries({ queryKey: ['ratePlanRates'] });
    },
  });
};

