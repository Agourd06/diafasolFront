import { useQuery } from '@tanstack/react-query';
import { getReservationCancellationPoliciesByProperty } from '../../../api/reservation-cancellation-policies.api';

export const useReservationCancellationPoliciesByProperty = (propertyId: string) => {
  return useQuery({
    queryKey: ['reservationCancellationPolicies', 'property', propertyId],
    queryFn: () => getReservationCancellationPoliciesByProperty(propertyId),
    enabled: !!propertyId,
  });
};

