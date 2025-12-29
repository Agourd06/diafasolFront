/**
 * Room Types API Client
 * 
 * Handles all API calls for room types CRUD operations.
 * All endpoints require JWT authentication.
 * The companyId is automatically extracted from the token.
 */

import axiosClient from './axiosClient';
import type {
  RoomType,
  CreateRoomTypePayload,
  UpdateRoomTypePayload,
  PaginatedRoomTypesResponse,
  RoomTypeQueryParams,
  RoomTypePropertyFilter,
} from '@/features/room-types/types';

const BASE_URL = '/room-types';

/**
 * Get all room types (paginated)
 * GET /api/room-types
 */
export const getRoomTypes = async (
  params?: RoomTypeQueryParams
): Promise<PaginatedRoomTypesResponse> => {
  try {
    // Transform camelCase propertyId to snake_case property_id for backend compatibility
    // Backend expects property_id (snake_case) as query parameter to match database column
    const apiParams: any = params ? { ...params } : {};
    
    // If propertyId is provided, send it as property_id (snake_case) which matches database column
    if (apiParams.propertyId) {
      apiParams.property_id = apiParams.propertyId;
      delete apiParams.propertyId; // Remove camelCase version to avoid confusion
    }
    
    console.log('🔍 Fetching room types with params:', params);
    console.log('🔍 API params being sent (transformed):', apiParams);
    
    const response = await axiosClient.get<PaginatedRoomTypesResponse>(
      BASE_URL,
      { params: apiParams }
    );
    
    console.log('✅ Room types fetched successfully:', {
      total: response.data.meta.total,
      count: response.data.data.length,
      roomTypes: response.data.data.map(rt => ({ id: rt.id, title: rt.title, propertyId: rt.propertyId }))
    });
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching room types:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Search room types
 * GET /api/room-types/search?q=<term>
 */
export const searchRoomTypes = async (query: string): Promise<RoomType[]> => {
  try {
    console.log('🔍 Searching room types with query:', query);
    const response = await axiosClient.get<RoomType[]>(
      `${BASE_URL}/search`,
      { params: { q: query } }
    );
    console.log('✅ Room types search completed:', response.data.length, 'results');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error searching room types:', error);
    throw error;
  }
};

/**
 * Filter room types by property
 * GET /api/room-types/filter?propertyId=<uuid>
 */
export const filterRoomTypesByProperty = async (
  filter: RoomTypePropertyFilter
): Promise<RoomType[]> => {
  try {
    console.log('🔍 Filtering room types by property:', filter);
    const response = await axiosClient.get<RoomType[]>(
      `${BASE_URL}/filter`,
      { params: filter }
    );
    console.log('✅ Room types filtered successfully:', response.data.length, 'results');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error filtering room types:', error);
    throw error;
  }
};

/**
 * Get room types by property ID
 * GET /api/room-types/property/:propertyId
 */
export const getRoomTypesByProperty = async (
  propertyId: string
): Promise<RoomType[]> => {
  try {
    console.log('🔍 Fetching room types for property:', propertyId);
    const response = await axiosClient.get<RoomType[]>(
      `${BASE_URL}/property/${propertyId}`
    );
    console.log('✅ Room types fetched for property:', response.data.length, 'results');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching room types by property:', error);
    throw error;
  }
};

/**
 * Get a single room type by ID
 * GET /api/room-types/:id
 */
export const getRoomTypeById = async (id: string): Promise<RoomType> => {
  try {
    console.log('🔍 Fetching room type by ID:', id);
    const response = await axiosClient.get<RoomType>(`${BASE_URL}/${id}`);
    console.log('✅ Room type fetched:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching room type:', error);
    throw error;
  }
};

/**
 * Create a new room type
 * POST /api/room-types
 * 
 * ⚠️ WARNING: Do NOT include companyId in the payload!
 * The companyId is automatically extracted from the JWT token.
 */
export const createRoomType = async (
  payload: CreateRoomTypePayload
): Promise<RoomType> => {
  try {
    console.log('📤 Creating room type:', payload);
    
    // Ensure companyId is NOT in the payload
    const cleanPayload = { ...payload };
    if ('companyId' in cleanPayload) {
      console.warn('⚠️ Removing companyId from payload - it is auto-set from JWT token');
      delete (cleanPayload as any).companyId;
    }
    
    const response = await axiosClient.post<RoomType>(BASE_URL, cleanPayload);
    console.log('✅ Room type created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating room type:', error);
    throw error;
  }
};

/**
 * Update an existing room type
 * PATCH /api/room-types/:id
 * 
 * ⚠️ WARNING: Do NOT include companyId in the payload!
 */
export const updateRoomType = async (
  id: string,
  payload: UpdateRoomTypePayload
): Promise<RoomType> => {
  try {
    console.log('📤 Updating room type:', id, payload);
    
    // Ensure companyId is NOT in the payload
    const cleanPayload = { ...payload };
    if ('companyId' in cleanPayload) {
      console.warn('⚠️ Removing companyId from payload - it cannot be updated');
      delete (cleanPayload as any).companyId;
    }
    
    const response = await axiosClient.patch<RoomType>(
      `${BASE_URL}/${id}`,
      cleanPayload
    );
    console.log('✅ Room type updated successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating room type:', error);
    throw error;
  }
};

/**
 * Delete a room type
 * DELETE /api/room-types/:id
 * 
 * Note: This will cascade delete all related data (availability, content, facilities, photos)
 */
export const deleteRoomType = async (id: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting room type:', id);
    await axiosClient.delete(`${BASE_URL}/${id}`);
    console.log('✅ Room type deleted successfully');
  } catch (error: any) {
    console.error('❌ Error deleting room type:', error);
    throw error;
  }
};

