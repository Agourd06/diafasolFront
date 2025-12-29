import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReservationAdvancePolicy } from '../../../api/reservation-advance-policies.api';
import type { CreateReservationAdvancePolicyDto } from '../types';

export const useCreateReservationAdvancePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReservationAdvancePolicyDto) =>
      createReservationAdvancePolicy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservationAdvancePolicies'] });
    },
  });
};

