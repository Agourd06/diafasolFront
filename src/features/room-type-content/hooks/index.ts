/**
 * Room Type Content Hooks - Centralized Exports
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRoomTypeContent,
  searchRoomTypeContent,
  getRoomTypeContentByRoomType,
  createRoomTypeContent,
  updateRoomTypeContent,
  deleteRoomTypeContent,
} from '@/api/room-type-content.api';
import type {
  RoomTypeContentQueryParams,
  CreateRoomTypeContentPayload,
  UpdateRoomTypeContentPayload,
} from '../types';

// Fetch all room type content (paginated)
export const useRoomTypeContent = (params?: RoomTypeContentQueryParams) => {
  return useQuery({
    queryKey: ['roomTypeContent', params],
    queryFn: () => getRoomTypeContent(params),
    staleTime: 1000 * 60 * 5,
  });
};

// Search room type content
export const useRoomTypeContentSearch = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['roomTypeContent', 'search', query],
    queryFn: () => searchRoomTypeContent(query),
    enabled: enabled && query.length > 0,
    staleTime: 1000 * 60 * 5,
  });
};

// Get content by room type
export const useRoomTypeContentByRoomType = (roomTypeId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['roomTypeContent', roomTypeId],
    queryFn: () => getRoomTypeContentByRoomType(roomTypeId),
    enabled: enabled && !!roomTypeId,
    staleTime: 1000 * 60 * 5,
  });
};

// Create room type content
export const useCreateRoomTypeContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRoomTypeContentPayload) =>
      createRoomTypeContent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomTypeContent'] });
    },
  });
};

// Update room type content
export const useUpdateRoomTypeContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomTypeId, payload }: { roomTypeId: string; payload: UpdateRoomTypeContentPayload }) =>
      updateRoomTypeContent(roomTypeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomTypeContent'] });
    },
  });
};

// Delete room type content
export const useDeleteRoomTypeContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomTypeId: string) => deleteRoomTypeContent(roomTypeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomTypeContent'] });
    },
  });
};

