import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteReservationAdvancePolicy } from '../../../api/reservation-advance-policies.api';

export const useDeleteReservationAdvancePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteReservationAdvancePolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservationAdvancePolicies'] });
    },
  });
};

