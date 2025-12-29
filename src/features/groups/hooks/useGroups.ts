import { useQuery } from '@tanstack/react-query';
import { getGroups } from '@/api/groups.api';
import type { GroupQueryParams } from '../types';

export const useGroups = (params?: GroupQueryParams) => {
  return useQuery({
    queryKey: ['groups', params],
    queryFn: () => getGroups(params),
  });
};
