/**
 * Room Type Facilities Hooks - Centralized Exports
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRoomTypeFacilities,
  getRoomTypeFacilitiesByRoomType,
  createRoomTypeFacilityLink,
  deleteRoomTypeFacilityLink,
} from '@/api/room-type-facilities.api';
import type {
  RoomTypeFacilityLinkQueryParams,
  CreateRoomTypeFacilityLinkPayload,
} from '../types';

// Fetch all room type facilities (paginated)
export const useRoomTypeFacilities = (params?: RoomTypeFacilityLinkQueryParams) => {
  return useQuery({
    queryKey: ['roomTypeFacilities', params],
    queryFn: () => getRoomTypeFacilities(params),
    staleTime: 1000 * 60 * 5,
  });
};

// Get facilities by room type
export const useRoomTypeFacilitiesByRoomType = (roomTypeId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['roomTypeFacilities', 'roomType', roomTypeId],
    queryFn: () => getRoomTypeFacilitiesByRoomType(roomTypeId),
    enabled: enabled && !!roomTypeId,
    staleTime: 1000 * 60 * 5,
  });
};

// Create room type-facility link
export const useCreateRoomTypeFacilityLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRoomTypeFacilityLinkPayload) =>
      createRoomTypeFacilityLink(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomTypeFacilities'] });
    },
  });
};

// Delete room type-facility link
export const useDeleteRoomTypeFacilityLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomTypeId, facilityId }: { roomTypeId: string; facilityId: string }) =>
      deleteRoomTypeFacilityLink(roomTypeId, facilityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomTypeFacilities'] });
    },
  });
};

