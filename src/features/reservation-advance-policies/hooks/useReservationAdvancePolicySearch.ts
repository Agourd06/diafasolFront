import { useQuery } from '@tanstack/react-query';
import { searchReservationAdvancePolicies } from '../../../api/reservation-advance-policies.api';

export const useReservationAdvancePolicySearch = (query: string) => {
  return useQuery({
    queryKey: ['reservationAdvancePolicies', 'search', query],
    queryFn: () => searchReservationAdvancePolicies(query),
    enabled: query.length > 0,
  });
};

