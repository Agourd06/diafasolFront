import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateReservationCancellationPolicyDateRange } from '../../../api/reservation-cancellation-policy-date-ranges.api';
import type { UpdateReservationCancellationPolicyDateRangeDto } from '../types';

export const useUpdateReservationCancellationPolicyDateRange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateReservationCancellationPolicyDateRangeDto;
    }) => updateReservationCancellationPolicyDateRange(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservationCancellationPolicyDateRanges'] });
      queryClient.invalidateQueries({ queryKey: ['reservationCancellationPolicyDateRange'] });
      queryClient.invalidateQueries({ queryKey: ['reservationCancellationPolicies'] });
    },
  });
};

