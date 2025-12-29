import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProperty } from '@/api/properties.api';
import { 
  updateChannexProperty as updateChannexPropertyApi,
  createChannexProperty as createChannexPropertyApi,
} from '@/api/channex.api';
import {
  getStoredChannexPropertyId,
  storeChannexPropertyId,
  mapPropertyToChannexUpdatePayload,
  mapPropertyToChannexCreatePayload,
  clearStoredChannexPropertyId,
} from '@/hooks/useChannexProperty';
import type { UpdatePropertyPayload, Property } from '../types';

export const useUpdateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePropertyPayload }) =>
      updateProperty(id, payload),
    onSuccess: async (updatedProperty: Property, variables) => {
      // Invalidate local queries
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties', variables.id] });

      // Auto-sync to Channex
      const storedChannexId = getStoredChannexPropertyId(variables.id);
      
      if (storedChannexId) {
        try {
          await updateChannexPropertyApi(storedChannexId, mapPropertyToChannexUpdatePayload(updatedProperty));
          queryClient.invalidateQueries({ queryKey: ['channex-property', variables.id] });
        } catch (error: unknown) {
          const err = error as { response?: { status?: number } };
          if (err.response?.status === 404) {
            // Property no longer exists in Channex - clear mapping and create new
            clearStoredChannexPropertyId(variables.id);
            try {
              const newChannexProperty = await createChannexPropertyApi(mapPropertyToChannexCreatePayload(updatedProperty));
              storeChannexPropertyId(variables.id, newChannexProperty.id);
              queryClient.invalidateQueries({ queryKey: ['channex-property', variables.id] });
            } catch {
              // Silent fail - don't block local update
            }
          }
        }
      }
    },
  });
};

