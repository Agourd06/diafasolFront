/**
 * Booking Guests Hooks
 * 
 * React Query hooks for managing booking guests (update and delete)
 * Note: useCreateBookingGuest is exported from useBookingMutations.ts
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  updateBookingGuest,
  deleteBookingGuest,
} from '../api/booking-guests.api';
import type {
  UpdateBookingGuestPayload,
} from '../types';

/**
 * Update a booking guest
 */
export const useUpdateBookingGuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBookingGuestPayload }) =>
      updateBookingGuest(id, payload),
    onSuccess: (_, variables) => {
      // Invalidate booking and guests queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookingGuests'] });
    },
  });
};

/**
 * Delete a booking guest
 */
export const useDeleteBookingGuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBookingGuest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookingGuests'] });
    },
  });
};
