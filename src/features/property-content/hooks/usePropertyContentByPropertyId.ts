import { useQuery } from '@tanstack/react-query';
import { getPropertyContentByPropertyId } from '@/api/property-content.api';

export const usePropertyContentByPropertyId = (propertyId: string) => {
  return useQuery({
    queryKey: ['property-content', propertyId],
    queryFn: () => getPropertyContentByPropertyId(propertyId),
    enabled: !!propertyId,
  });
};

