import { useQuery } from '@tanstack/react-query';
import { getReservationCancellationPolicies } from '../../../api/reservation-cancellation-policies.api';

export const useReservationCancellationPolicies = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['reservationCancellationPolicies', params],
    queryFn: () => getReservationCancellationPolicies(params),
  });
};

