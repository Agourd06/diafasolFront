import { useQuery } from '@tanstack/react-query';
import { getReservationAdvancePolicyDateRangeById } from '../../../api/reservation-advance-policy-date-ranges.api';

export const useReservationAdvancePolicyDateRange = (id: number) => {
  return useQuery({
    queryKey: ['reservationAdvancePolicyDateRange', id],
    queryFn: () => getReservationAdvancePolicyDateRangeById(id),
    enabled: !!id,
  });
};

