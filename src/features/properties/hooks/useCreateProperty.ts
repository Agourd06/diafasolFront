import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProperty } from '@/api/properties.api';
import type { CreatePropertyPayload } from '../types';

export const useCreateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePropertyPayload) => createProperty(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
};

