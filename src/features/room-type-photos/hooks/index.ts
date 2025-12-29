/**
 * Room Type Photos Hooks - Centralized Exports
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRoomTypePhotos,
  searchRoomTypePhotos,
  getRoomTypePhotosByRoomType,
  getRoomTypePhotoById,
  createRoomTypePhoto,
  updateRoomTypePhoto,
  deleteRoomTypePhoto,
} from '@/api/room-type-photos.api';
import type {
  RoomTypePhotoQueryParams,
  CreateRoomTypePhotoPayload,
  UpdateRoomTypePhotoPayload,
} from '../types';

// Fetch all room type photos (paginated)
export const useRoomTypePhotos = (params?: RoomTypePhotoQueryParams) => {
  return useQuery({
    queryKey: ['roomTypePhotos', params],
    queryFn: () => getRoomTypePhotos(params),
    staleTime: 1000 * 60 * 5,
  });
};

// Search room type photos
export const useRoomTypePhotosSearch = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['roomTypePhotos', 'search', query],
    queryFn: () => searchRoomTypePhotos(query),
    enabled: enabled && query.length > 0,
    staleTime: 1000 * 60 * 5,
  });
};

// Get photos by room type
export const useRoomTypePhotosByRoomType = (roomTypeId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['roomTypePhotos', 'roomType', roomTypeId],
    queryFn: () => getRoomTypePhotosByRoomType(roomTypeId),
    enabled: enabled && !!roomTypeId,
    staleTime: 1000 * 60 * 5,
  });
};

// Get photo by ID
export const useRoomTypePhotoById = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['roomTypePhotos', id],
    queryFn: () => getRoomTypePhotoById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
  });
};

// Create room type photo
export const useCreateRoomTypePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRoomTypePhotoPayload) =>
      createRoomTypePhoto(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomTypePhotos'] });
    },
  });
};

// Update room type photo
export const useUpdateRoomTypePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRoomTypePhotoPayload }) =>
      updateRoomTypePhoto(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['roomTypePhotos'] });
      queryClient.invalidateQueries({ queryKey: ['roomTypePhotos', data.id] });
    },
  });
};

// Delete room type photo
export const useDeleteRoomTypePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRoomTypePhoto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomTypePhotos'] });
    },
  });
};

