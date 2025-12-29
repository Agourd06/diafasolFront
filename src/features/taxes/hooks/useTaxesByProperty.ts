import { useQuery } from '@tanstack/react-query';
import { getTaxesByProperty } from '@/api/taxes.api';

export const useTaxesByProperty = (propertyId: string) => {
  return useQuery({
    queryKey: ['taxes', 'property', propertyId],
    queryFn: () => getTaxesByProperty(propertyId),
    enabled: !!propertyId,
  });
};

