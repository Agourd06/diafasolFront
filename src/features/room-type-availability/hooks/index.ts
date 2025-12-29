/**
 * Room Type Availability Hooks - Centralized Exports
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRoomTypeAvailability,
  searchRoomTypeAvailability,
  getRoomTypeAvailabilityByRoomType,
  getRoomTypeAvailabilityByDateRange,
  getRoomTypeAvailabilityById,
  createRoomTypeAvailability,
  updateRoomTypeAvailability,
  deleteRoomTypeAvailability,
} from '@/api/room-type-availability.api';
import type {
  RoomTypeAvailabilityQueryParams,
  RoomTypeAvailabilityDateRange,
  CreateRoomTypeAvailabilityPayload,
  UpdateRoomTypeAvailabilityPayload,
} from '../types';

export * from './useGenerateYearlyAvailability';

// Fetch all availability (paginated)
export const useRoomTypeAvailability = (params?: RoomTypeAvailabilityQueryParams) => {
  return useQuery({
    queryKey: ['roomTypeAvailability', params],
    queryFn: () => getRoomTypeAvailability(params),
    staleTime: 1000 * 60 * 5,
  });
};

// Search availability
export const useRoomTypeAvailabilitySearch = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['roomTypeAvailability', 'search', query],
    queryFn: () => searchRoomTypeAvailability(query),
    enabled: enabled && query.length > 0,
    staleTime: 1000 * 60 * 5,
  });
};

// Get availability by room type
export const useRoomTypeAvailabilityByRoomType = (roomTypeId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['roomTypeAvailability', 'roomType', roomTypeId],
    queryFn: () => getRoomTypeAvailabilityByRoomType(roomTypeId),
    enabled: enabled && !!roomTypeId,
    staleTime: 1000 * 60 * 5,
  });
};

// Get availability by date range
export const useRoomTypeAvailabilityByDateRange = (
  dateRange: RoomTypeAvailabilityDateRange,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['roomTypeAvailability', 'dateRange', dateRange],
    queryFn: () => getRoomTypeAvailabilityByDateRange(dateRange),
    enabled: enabled && !!dateRange.startDate && !!dateRange.endDate,
    staleTime: 1000 * 60 * 5,
  });
};

// Get availability by ID
export const useRoomTypeAvailabilityById = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['roomTypeAvailability', id],
    queryFn: () => getRoomTypeAvailabilityById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
  });
};

// Create availability
export const useCreateRoomTypeAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRoomTypeAvailabilityPayload) =>
      createRoomTypeAvailability(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomTypeAvailability'] });
    },
  });
};

// Update availability
export const useUpdateRoomTypeAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateRoomTypeAvailabilityPayload }) =>
      updateRoomTypeAvailability(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['roomTypeAvailability'] });
      queryClient.invalidateQueries({ queryKey: ['roomTypeAvailability', data.id] });
    },
  });
};

// Delete availability
export const useDeleteRoomTypeAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteRoomTypeAvailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomTypeAvailability'] });
    },
  });
};

