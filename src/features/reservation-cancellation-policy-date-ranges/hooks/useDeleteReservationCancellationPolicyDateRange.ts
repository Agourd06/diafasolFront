import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteReservationCancellationPolicyDateRange } from '../../../api/reservation-cancellation-policy-date-ranges.api';

export const useDeleteReservationCancellationPolicyDateRange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteReservationCancellationPolicyDateRange(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservationCancellationPolicyDateRanges'] });
      queryClient.invalidateQueries({ queryKey: ['reservationCancellationPolicies'] });
    },
  });
};

