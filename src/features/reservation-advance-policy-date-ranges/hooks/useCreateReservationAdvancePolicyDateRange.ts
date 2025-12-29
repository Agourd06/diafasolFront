import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReservationAdvancePolicyDateRange } from '../../../api/reservation-advance-policy-date-ranges.api';
import type { CreateReservationAdvancePolicyDateRangeDto } from '../types';

export const useCreateReservationAdvancePolicyDateRange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReservationAdvancePolicyDateRangeDto) =>
      createReservationAdvancePolicyDateRange(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservationAdvancePolicyDateRanges'] });
      queryClient.invalidateQueries({ queryKey: ['reservationAdvancePolicies'] });
    },
  });
};

