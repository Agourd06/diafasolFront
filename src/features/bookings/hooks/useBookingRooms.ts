/**
 * Booking Rooms Hooks
 * 
 * React Query hooks for managing booking rooms
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createBookingRoom,
  updateBookingRoom,
  deleteBookingRoom,
} from '../api';
import type {
  CreateBookingRoomPayload,
  UpdateBookingRoomPayload,
} from '../types';

/**
 * Create a new booking room
 */
export const useCreateBookingRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingRoomPayload) => createBookingRoom(payload),
    onSuccess: (_, variables) => {
      // Invalidate the parent booking to refetch with new room
      queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId] });
    },
  });
};

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
    },
  });
};

