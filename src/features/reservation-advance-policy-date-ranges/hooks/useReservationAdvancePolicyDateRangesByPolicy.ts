import { useQuery } from '@tanstack/react-query';
import { getReservationAdvancePolicyDateRangesByPolicy } from '../../../api/reservation-advance-policy-date-ranges.api';

export const useReservationAdvancePolicyDateRangesByPolicy = (policyId: string) => {
  return useQuery({
    queryKey: ['reservationAdvancePolicyDateRanges', 'policy', policyId],
    queryFn: () => getReservationAdvancePolicyDateRangesByPolicy(policyId),
    enabled: !!policyId,
  });
};

