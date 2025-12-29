import { useQuery } from '@tanstack/react-query';
import { getPropertyContents } from '@/api/property-content.api';
import type { PropertyContentQueryParams } from '../types';

export const usePropertyContents = (params?: PropertyContentQueryParams) => {
  return useQuery({
    queryKey: ['property-contents', params],
    queryFn: () => getPropertyContents(params),
  });
};

