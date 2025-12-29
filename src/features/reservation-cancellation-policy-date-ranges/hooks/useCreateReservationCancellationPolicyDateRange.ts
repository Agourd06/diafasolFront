import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReservationCancellationPolicyDateRange } from '../../../api/reservation-cancellation-policy-date-ranges.api';
import type { CreateReservationCancellationPolicyDateRangeDto } from '../types';

export const useCreateReservationCancellationPolicyDateRange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReservationCancellationPolicyDateRangeDto) =>
      createReservationCancellationPolicyDateRange(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservationCancellationPolicyDateRanges'] });
      queryClient.invalidateQueries({ queryKey: ['reservationCancellationPolicies'] });
    },
  });
};

