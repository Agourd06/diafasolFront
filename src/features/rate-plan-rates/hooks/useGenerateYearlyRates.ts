import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateYearlyRates, type GenerateYearlyRatesResponse } from '@/api/rate-plan-rates.api';

export const useGenerateYearlyRates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ratePlanId: string) => generateYearlyRates(ratePlanId),
    onSuccess: (data: GenerateYearlyRatesResponse, ratePlanId: string) => {
      // Invalidate rate plan rates queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['ratePlanRates'] });
      queryClient.invalidateQueries({ queryKey: ['ratePlanRates', 'rate-plan', ratePlanId] });
      // Also invalidate the rate plan detail query to refresh rates count
      queryClient.invalidateQueries({ queryKey: ['ratePlan', ratePlanId] });
    },
  });
};
