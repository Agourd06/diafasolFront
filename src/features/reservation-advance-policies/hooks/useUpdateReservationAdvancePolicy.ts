import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateReservationAdvancePolicy } from '../../../api/reservation-advance-policies.api';
import type { UpdateReservationAdvancePolicyDto } from '../types';

export const useUpdateReservationAdvancePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReservationAdvancePolicyDto }) =>
      updateReservationAdvancePolicy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservationAdvancePolicies'] });
      queryClient.invalidateQueries({ queryKey: ['reservationAdvancePolicy'] });
    },
  });
};

