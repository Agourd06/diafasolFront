import { useQuery } from '@tanstack/react-query';
import { getTaxById } from '@/api/taxes.api';

export const useTax = (id: string) => {
  return useQuery({
    queryKey: ['taxes', id],
    queryFn: () => getTaxById(id),
    enabled: !!id,
  });
};

