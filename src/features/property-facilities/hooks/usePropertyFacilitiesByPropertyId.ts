import { useQuery } from '@tanstack/react-query';
import { getPropertyFacilitiesByPropertyId } from '@/api/property-facilities.api';

export const usePropertyFacilitiesByPropertyId = (propertyId: string) => {
  return useQuery({
    queryKey: ['property-facilities', 'property', propertyId],
    queryFn: () => getPropertyFacilitiesByPropertyId(propertyId),
    enabled: !!propertyId,
  });
};

