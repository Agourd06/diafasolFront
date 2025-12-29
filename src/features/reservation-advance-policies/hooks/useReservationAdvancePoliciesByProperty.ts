import { useQuery } from '@tanstack/react-query';
import { getReservationAdvancePoliciesByProperty } from '../../../api/reservation-advance-policies.api';

export const useReservationAdvancePoliciesByProperty = (propertyId: string) => {
  return useQuery({
    queryKey: ['reservationAdvancePolicies', 'property', propertyId],
    queryFn: () => getReservationAdvancePoliciesByProperty(propertyId),
    enabled: !!propertyId,
  });
};

