import { useQuery } from '@tanstack/react-query';
import { getGroupById } from '@/api/groups.api';

interface UseGroupOptions {
  enabled?: boolean;
}

export const useGroup = (id: string, options?: UseGroupOptions) => {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: () => getGroupById(id),
    enabled: options?.enabled !== false && !!id,
  });
};
