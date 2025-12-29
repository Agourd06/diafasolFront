import { useQuery } from '@tanstack/react-query';
import { searchReservationCancellationPolicies } from '../../../api/reservation-cancellation-policies.api';

export const useReservationCancellationPolicySearch = (query: string) => {
  return useQuery({
    queryKey: ['reservationCancellationPolicies', 'search', query],
    queryFn: () => searchReservationCancellationPolicies(query),
    enabled: query.length > 0,
  });
};

