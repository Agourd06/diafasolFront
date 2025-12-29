import { useQuery } from '@tanstack/react-query';
import { getReservationCancellationPolicyDateRangeById } from '../../../api/reservation-cancellation-policy-date-ranges.api';

export const useReservationCancellationPolicyDateRange = (id: number) => {
  return useQuery({
    queryKey: ['reservationCancellationPolicyDateRange', id],
    queryFn: () => getReservationCancellationPolicyDateRangeById(id),
    enabled: !!id,
  });
};

