/**
 * Booking Mutations Hooks
 * 
 * React Query hooks for all booking-related mutations
 * (rooms, days, services, guarantees, guests, revisions)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createBookingRoom,
  createBookingRoomDay,
  createBookingService,
  createBookingGuarantee,
  createBookingGuest,
  createBookingRevision,
} from '../api';
import type {
  CreateBookingRoomPayload,
  CreateBookingRoomDayPayload,
  CreateBookingServicePayload,
  CreateBookingGuaranteePayload,
  CreateBookingGuestPayload,
  CreateBookingRevisionPayload,
} from '../types';

/**
 * Create booking room (Step 2)
 */
export const useCreateBookingRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingRoomPayload) => createBookingRoom(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId] });
    },
  });
};

/**
 * Create booking room day (Step 3)
 */
export const useCreateBookingRoomDay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingRoomDayPayload) => createBookingRoomDay(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

/**
 * Create booking service (Step 4)
 */
export const useCreateBookingService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingServicePayload) => createBookingService(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId] });
    },
  });
};

/**
 * Create booking guarantee (Step 5)
 */
export const useCreateBookingGuarantee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingGuaranteePayload) => createBookingGuarantee(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId] });
    },
  });
};

/**
 * Create booking guest (Step 6)
 */
export const useCreateBookingGuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingGuestPayload) => createBookingGuest(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId] });
    },
  });
};

/**
 * Create booking revision (Step 7)
 */
export const useCreateBookingRevision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingRevisionPayload) => createBookingRevision(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId] });
    },
  });
};

