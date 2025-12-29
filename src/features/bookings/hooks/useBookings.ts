/**
 * Bookings Hooks
 * 
 * React Query hooks for fetching and managing bookings
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
} from '../api';
import type {
  GetBookingsParams,
  CompleteBooking,
  CreateBookingPayload,
  UpdateBookingPayload,
} from '../types';

/**
 * Fetch paginated list of bookings with filters
 */
export const useBookings = (params: GetBookingsParams) => {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => getBookings(params),
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Fetch a single booking by ID (with nested data)
 */
export const useBooking = (bookingId: string | null) => {
  return useQuery<CompleteBooking, Error>({
    queryKey: ['booking', bookingId],
    queryFn: () => getBookingById(bookingId!),
    enabled: !!bookingId,
  });
};

/**
 * Create a new booking
 */
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => createBooking(payload),
    onSuccess: () => {
      // Invalidate bookings list to refetch
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

/**
 * Update an existing booking
 */
export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBookingPayload }) =>
      updateBooking(id, payload),
    onSuccess: (_, variables) => {
      // Invalidate specific booking and list
      queryClient.invalidateQueries({ queryKey: ['booking', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

/**
 * Delete a booking
 */
export const useDeleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBooking(id),
    onSuccess: () => {
      // Invalidate bookings list
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

