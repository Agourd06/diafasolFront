import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateReservationAdvancePolicyDateRange } from '../../../api/reservation-advance-policy-date-ranges.api';
import type { UpdateReservationAdvancePolicyDateRangeDto } from '../types';

export const useUpdateReservationAdvancePolicyDateRange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateReservationAdvancePolicyDateRangeDto }) =>
      updateReservationAdvancePolicyDateRange(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservationAdvancePolicyDateRanges'] });
      queryClient.invalidateQueries({ queryKey: ['reservationAdvancePolicyDateRange'] });
      queryClient.invalidateQueries({ queryKey: ['reservationAdvancePolicies'] });
    },
  });
};

