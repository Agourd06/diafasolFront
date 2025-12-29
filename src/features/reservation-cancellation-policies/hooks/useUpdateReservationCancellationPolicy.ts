import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateReservationCancellationPolicy } from '../../../api/reservation-cancellation-policies.api';
import type { UpdateReservationCancellationPolicyDto } from '../types';

export const useUpdateReservationCancellationPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReservationCancellationPolicyDto }) =>
      updateReservationCancellationPolicy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservationCancellationPolicies'] });
      queryClient.invalidateQueries({ queryKey: ['reservationCancellationPolicy'] });
    },
  });
};

