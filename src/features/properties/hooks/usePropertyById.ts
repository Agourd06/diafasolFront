import { useQuery } from '@tanstack/react-query';
import { getPropertyById } from '@/api/properties.api';

export const usePropertyById = (id: string) => {
  return useQuery({
    queryKey: ['properties', id],
    queryFn: () => getPropertyById(id),
    enabled: !!id,
  });
};

