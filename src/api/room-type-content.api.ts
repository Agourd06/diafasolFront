/**
 * Room Type Content API Client
 * 
 * Handles all API calls for room type content operations.
 */

import axiosClient from './axiosClient';
import type {
  RoomTypeContent,
  CreateRoomTypeContentPayload,
  UpdateRoomTypeContentPayload,
  PaginatedRoomTypeContentResponse,
  RoomTypeContentQueryParams,
} from '@/features/room-type-content/types';

const BASE_URL = '/room-type-content';

/**
 * Get all room type content (paginated)
 * GET /api/room-type-content
 */
export const getRoomTypeContent = async (
  params?: RoomTypeContentQueryParams
): Promise<PaginatedRoomTypeContentResponse> => {
  try {
    console.log('🔍 Fetching room type content with params:', params);
    const response = await axiosClient.get<PaginatedRoomTypeContentResponse>(
      BASE_URL,
      { params }
    );
    console.log('✅ Room type content fetched successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching room type content:', error);
    throw error;
  }
};

/**
 * Search room type content
 * GET /api/room-type-content/search?q=<term>
 */
export const searchRoomTypeContent = async (query: string): Promise<RoomTypeContent[]> => {
  try {
    console.log('🔍 Searching room type content with query:', query);
    const response = await axiosClient.get<RoomTypeContent[]>(
      `${BASE_URL}/search`,
      { params: { q: query } }
    );
    console.log('✅ Room type content search completed:', response.data.length, 'results');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error searching room type content:', error);
    throw error;
  }
};

/**
 * Get content by room type ID
 * GET /api/room-type-content/:roomTypeId
 */
export const getRoomTypeContentByRoomType = async (
  roomTypeId: string
): Promise<RoomTypeContent> => {
  try {
    console.log('🔍 Fetching content for room type:', roomTypeId);
    const response = await axiosClient.get<RoomTypeContent>(
      `${BASE_URL}/${roomTypeId}`
    );
    console.log('✅ Content fetched for room type:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching content by room type:', error);
    throw error;
  }
};

/**
 * Create new room type content
 * POST /api/room-type-content
 * 
 * ⚠️ WARNING: Do NOT include companyId in the payload!
 */
export const createRoomTypeContent = async (
  payload: CreateRoomTypeContentPayload
): Promise<RoomTypeContent> => {
  try {
    console.log('📤 Creating room type content:', payload);
    
    const cleanPayload = { ...payload };
    if ('companyId' in cleanPayload) {
      console.warn('⚠️ Removing companyId from payload');
      delete (cleanPayload as any).companyId;
    }
    
    const response = await axiosClient.post<RoomTypeContent>(BASE_URL, cleanPayload);
    console.log('✅ Room type content created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating room type content:', error);
    throw error;
  }
};

/**
 * Update existing room type content
 * PATCH /api/room-type-content/:roomTypeId
 */
export const updateRoomTypeContent = async (
  roomTypeId: string,
  payload: UpdateRoomTypeContentPayload
): Promise<RoomTypeContent> => {
  try {
    console.log('📤 Updating room type content:', roomTypeId, payload);
    const response = await axiosClient.patch<RoomTypeContent>(
      `${BASE_URL}/${roomTypeId}`,
      payload
    );
    console.log('✅ Room type content updated successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating room type content:', error);
    throw error;
  }
};

/**
 * Delete room type content
 * DELETE /api/room-type-content/:roomTypeId
 */
export const deleteRoomTypeContent = async (roomTypeId: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting room type content:', roomTypeId);
    await axiosClient.delete(`${BASE_URL}/${roomTypeId}`);
    console.log('✅ Room type content deleted successfully');
  } catch (error: any) {
    console.error('❌ Error deleting room type content:', error);
    throw error;
  }
};

