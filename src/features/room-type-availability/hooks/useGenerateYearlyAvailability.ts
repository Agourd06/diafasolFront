import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateYearlyAvailability, type GenerateYearlyAvailabilityResponse } from '@/api/room-type-availability.api';

export const useGenerateYearlyAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomTypeId: string) => generateYearlyAvailability(roomTypeId),
    onSuccess: (data: GenerateYearlyAvailabilityResponse, roomTypeId: string) => {
      queryClient.invalidateQueries({ queryKey: ['roomTypeAvailability'] });
      queryClient.invalidateQueries({ queryKey: ['roomTypeAvailability', 'roomType', roomTypeId] });
      queryClient.invalidateQueries({ queryKey: ['roomType', roomTypeId] });
    },
  });
};
