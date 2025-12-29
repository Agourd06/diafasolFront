import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReservationCancellationPolicy } from '../../../api/reservation-cancellation-policies.api';
import type { CreateReservationCancellationPolicyDto } from '../types';

export const useCreateReservationCancellationPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReservationCancellationPolicyDto) =>
      createReservationCancellationPolicy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservationCancellationPolicies'] });
    },
  });
};

