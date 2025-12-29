import { useQuery } from '@tanstack/react-query';
import { getPropertyFacilities } from '@/api/property-facilities.api';
import type { PropertyFacilitiesQueryParams } from '../types';

export const usePropertyFacilities = (params?: PropertyFacilitiesQueryParams) => {
  return useQuery({
    queryKey: ['property-facilities', params],
    queryFn: () => getPropertyFacilities(params),
  });
};

