import { useQuery } from '@tanstack/react-query';
import { getReservationAdvancePolicies } from '../../../api/reservation-advance-policies.api';

export const useReservationAdvancePolicies = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['reservationAdvancePolicies', params],
    queryFn: () => getReservationAdvancePolicies(params),
  });
};

