import { useQuery } from '@tanstack/react-query';
import { getProperties } from '@/api/properties.api';
import type { PropertyQueryParams } from '../types';

export const useProperties = (params?: PropertyQueryParams) => {
  return useQuery({
    queryKey: ['properties', params],
    queryFn: () => getProperties(params),
  });
};

