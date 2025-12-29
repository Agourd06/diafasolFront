import { useQuery } from '@tanstack/react-query';
import { getReservationAdvancePolicyById } from '../../../api/reservation-advance-policies.api';

export const useReservationAdvancePolicy = (id: string) => {
  return useQuery({
    queryKey: ['reservationAdvancePolicy', id],
    queryFn: () => getReservationAdvancePolicyById(id),
    enabled: !!id,
  });
};

