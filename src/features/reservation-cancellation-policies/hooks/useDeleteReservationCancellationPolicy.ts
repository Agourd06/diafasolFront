import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteReservationCancellationPolicy } from '../../../api/reservation-cancellation-policies.api';

export const useDeleteReservationCancellationPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteReservationCancellationPolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservationCancellationPolicies'] });
    },
  });
};

