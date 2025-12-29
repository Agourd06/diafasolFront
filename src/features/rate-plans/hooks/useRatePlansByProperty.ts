import { useQuery } from '@tanstack/react-query';
import { getRatePlansByProperty } from '@/api/rate-plans.api';

export const useRatePlansByProperty = (propertyId: string) => {
  return useQuery({
    queryKey: ['ratePlans', 'property', propertyId],
    queryFn: () => getRatePlansByProperty(propertyId),
    enabled: !!propertyId,
  });
};

