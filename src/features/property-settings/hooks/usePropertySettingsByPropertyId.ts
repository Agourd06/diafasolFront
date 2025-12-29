import { useQuery } from '@tanstack/react-query';
import { getPropertySettingsByPropertyId } from '@/api/property-settings.api';

export const usePropertySettingsByPropertyId = (propertyId: string) => {
  return useQuery({
    queryKey: ['property-settings', propertyId],
    queryFn: () => getPropertySettingsByPropertyId(propertyId),
    enabled: !!propertyId,
  });
};

