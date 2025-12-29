import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePropertyFacilityLink } from '@/api/property-facilities.api';

export const useDeletePropertyFacilityLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, facilityId }: { propertyId: string; facilityId: string }) =>
      deletePropertyFacilityLink(propertyId, facilityId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property-facilities'] });
      queryClient.invalidateQueries({ queryKey: ['property-facilities', 'property', variables.propertyId] });
    },
  });
};

