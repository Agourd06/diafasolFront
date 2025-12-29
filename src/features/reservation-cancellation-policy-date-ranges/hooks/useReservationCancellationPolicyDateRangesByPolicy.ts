import { useQuery } from '@tanstack/react-query';
import { getReservationCancellationPolicyDateRangesByPolicy } from '../../../api/reservation-cancellation-policy-date-ranges.api';

export const useReservationCancellationPolicyDateRangesByPolicy = (policyId: string) => {
  return useQuery({
    queryKey: ['reservationCancellationPolicyDateRanges', 'policy', policyId],
    queryFn: () => getReservationCancellationPolicyDateRangesByPolicy(policyId),
    enabled: !!policyId,
  });
};

