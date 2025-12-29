import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePropertySettings } from '@/api/property-settings.api';

export const useDeletePropertySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) => deletePropertySettings(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-settings'] });
    },
  });
};

