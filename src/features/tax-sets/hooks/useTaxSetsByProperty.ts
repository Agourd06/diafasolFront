import { useQuery } from '@tanstack/react-query';
import { getTaxSetsByProperty } from '@/api/tax-sets.api';

export const useTaxSetsByProperty = (propertyId: string) => {
  return useQuery({
    queryKey: ['taxSets', 'property', propertyId],
    queryFn: () => getTaxSetsByProperty(propertyId),
    enabled: !!propertyId,
  });
};

