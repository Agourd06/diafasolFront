/**
 * Booking Rooms Hooks
 * 
 * React Query hooks for managing booking rooms (update and delete)
 * Note: useCreateBookingRoom is exported from useBookingMutations.ts
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  updateBookingRoom,
  deleteBookingRoom,
  getBookingRoomsByBookingId,
} from '../api';
import type {
  UpdateBookingRoomPayload,
  GetBookingRoomsParams,
} from '../api/booking-rooms.api';

/**
 * Update a booking room
 */
export const useUpdateBookingRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBookingRoomPayload }) =>
      updateBookingRoom(id, payload),
    onSuccess: () => {
      // Invalidate all bookings (we don't know which booking this room belongs to)
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

/**
 * Delete a booking room
 */
export const useDeleteBookingRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBookingRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookingRooms'] });
    },
  });
};

/**
 * Get all booking rooms for a booking
 */
export const useBookingRoomsByBookingId = (
  params: GetBookingRoomsParams,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['bookingRooms', 'booking', params.bookingId, params.includeDays],
    queryFn: () => getBookingRoomsByBookingId(params),
    enabled: enabled && !!params.bookingId,
  });
};

