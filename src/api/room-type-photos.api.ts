/**
 * Room Type Photos API Client
 * 
 * Handles all API calls for room type photos operations.
 */

import axiosClient from './axiosClient';
import type {
  RoomTypePhoto,
  CreateRoomTypePhotoPayload,
  UpdateRoomTypePhotoPayload,
  PaginatedRoomTypePhotosResponse,
  RoomTypePhotoQueryParams,
} from '@/features/room-type-photos/types';

const BASE_URL = '/room-type-photos';

/**
 * Get all room type photos (paginated)
 * GET /api/room-type-photos
 */
export const getRoomTypePhotos = async (
  params?: RoomTypePhotoQueryParams
): Promise<PaginatedRoomTypePhotosResponse> => {
  try {
    console.log('🔍 Fetching room type photos with params:', params);
    const response = await axiosClient.get<PaginatedRoomTypePhotosResponse>(
      BASE_URL,
      { params }
    );
    console.log('✅ Room type photos fetched successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching room type photos:', error);
    throw error;
  }
};

/**
 * Search room type photos
 * GET /api/room-type-photos/search?q=<term>
 */
export const searchRoomTypePhotos = async (query: string): Promise<RoomTypePhoto[]> => {
  try {
    console.log('🔍 Searching room type photos with query:', query);
    const response = await axiosClient.get<RoomTypePhoto[]>(
      `${BASE_URL}/search`,
      { params: { q: query } }
    );
    console.log('✅ Room type photos search completed:', response.data.length, 'results');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error searching room type photos:', error);
    throw error;
  }
};

/**
 * Get photos by room type
 * GET /api/room-type-photos/room-type/:roomTypeId
 */
export const getRoomTypePhotosByRoomType = async (
  roomTypeId: string
): Promise<RoomTypePhoto[]> => {
  try {
    console.log('🔍 Fetching photos for room type:', roomTypeId);
    const response = await axiosClient.get<RoomTypePhoto[]>(
      `${BASE_URL}/room-type/${roomTypeId}`
    );
    console.log('✅ Photos fetched for room type:', response.data.length, 'results');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching photos by room type:', error);
    throw error;
  }
};

/**
 * Get photo by ID
 * GET /api/room-type-photos/:id
 */
export const getRoomTypePhotoById = async (id: string): Promise<RoomTypePhoto> => {
  try {
    console.log('🔍 Fetching room type photo by ID:', id);
    const response = await axiosClient.get<RoomTypePhoto>(`${BASE_URL}/${id}`);
    console.log('✅ Room type photo fetched:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching room type photo:', error);
    throw error;
  }
};

/**
 * Create new room type photo
 * POST /api/room-type-photos
 */
export const createRoomTypePhoto = async (
  payload: CreateRoomTypePhotoPayload
): Promise<RoomTypePhoto> => {
  try {
    console.log('📤 Creating room type photo:', payload);
    
    const cleanPayload = { ...payload };
    if ('companyId' in cleanPayload) {
      console.warn('⚠️ Removing companyId from payload');
      delete (cleanPayload as any).companyId;
    }
    
    const response = await axiosClient.post<RoomTypePhoto>(BASE_URL, cleanPayload);
    console.log('✅ Room type photo created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating room type photo:', error);
    throw error;
  }
};

/**
 * Update existing room type photo
 * PATCH /api/room-type-photos/:id
 */
export const updateRoomTypePhoto = async (
  id: string,
  payload: UpdateRoomTypePhotoPayload
): Promise<RoomTypePhoto> => {
  try {
    console.log('📤 Updating room type photo:', id, payload);
    const response = await axiosClient.patch<RoomTypePhoto>(
      `${BASE_URL}/${id}`,
      payload
    );
    console.log('✅ Room type photo updated successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating room type photo:', error);
    throw error;
  }
};

/**
 * Delete room type photo
 * DELETE /api/room-type-photos/:id
 */
export const deleteRoomTypePhoto = async (id: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting room type photo:', id);
    await axiosClient.delete(`${BASE_URL}/${id}`);
    console.log('✅ Room type photo deleted successfully');
  } catch (error: any) {
    console.error('❌ Error deleting room type photo:', error);
    throw error;
  }
};

