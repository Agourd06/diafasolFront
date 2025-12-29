import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePropertyContent } from '@/api/property-content.api';

export const useDeletePropertyContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) => deletePropertyContent(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-contents'] });
    },
  });
};

