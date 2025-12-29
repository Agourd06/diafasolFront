import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPropertyFacilityLink } from '@/api/property-facilities.api';
import type { CreatePropertyFacilityLinkPayload } from '../types';

export const useCreatePropertyFacilityLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePropertyFacilityLinkPayload) => createPropertyFacilityLink(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['property-facilities'] });
      queryClient.invalidateQueries({ queryKey: ['property-facilities', 'property', data.propertyId] });
    },
  });
};

