import { useQuery } from '@tanstack/react-query';
import { getReservationCancellationPolicyById } from '../../../api/reservation-cancellation-policies.api';

export const useReservationCancellationPolicy = (id: string) => {
  return useQuery({
    queryKey: ['reservationCancellationPolicy', id],
    queryFn: () => getReservationCancellationPolicyById(id),
    enabled: !!id,
  });
};

