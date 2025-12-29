import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteReservationAdvancePolicyDateRange } from '../../../api/reservation-advance-policy-date-ranges.api';

export const useDeleteReservationAdvancePolicyDateRange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteReservationAdvancePolicyDateRange(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservationAdvancePolicyDateRanges'] });
      queryClient.invalidateQueries({ queryKey: ['reservationAdvancePolicies'] });
    },
  });
};

