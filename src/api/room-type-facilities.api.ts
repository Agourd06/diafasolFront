/**
 * Room Type Facilities API Client
 * 
 * Handles many-to-many relationships between room types and facilities.
 */

import axiosClient from './axiosClient';
import type {
  RoomTypeFacilityLink,
  CreateRoomTypeFacilityLinkPayload,
  PaginatedRoomTypeFacilityLinksResponse,
  RoomTypeFacilityLinkQueryParams,
} from '@/features/room-type-facilities/types';

const BASE_URL = '/room-type-facilities';

/**
 * Get all room type-facility links (paginated)
 * GET /api/room-type-facilities
 */
export const getRoomTypeFacilities = async (
  params?: RoomTypeFacilityLinkQueryParams
): Promise<PaginatedRoomTypeFacilityLinksResponse> => {
  try {
    console.log('🔍 Fetching room type facilities with params:', params);
    const response = await axiosClient.get<PaginatedRoomTypeFacilityLinksResponse>(
      BASE_URL,
      { params }
    );
    console.log('✅ Room type facilities fetched successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching room type facilities:', error);
    throw error;
  }
};

/**
 * Get facilities by room type
 * GET /api/room-type-facilities/room-type/:roomTypeId
 */
export const getRoomTypeFacilitiesByRoomType = async (
  roomTypeId: string
): Promise<RoomTypeFacilityLink[]> => {
  try {
    console.log('🔍 Fetching facilities for room type:', roomTypeId);
    const response = await axiosClient.get<RoomTypeFacilityLink[]>(
      `${BASE_URL}/room-type/${roomTypeId}`
    );
    console.log('✅ Facilities fetched for room type:', response.data.length, 'results');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching facilities by room type:', error);
    throw error;
  }
};

/**
 * Add facility to room type
 * POST /api/room-type-facilities
 * 
 * ⚠️ WARNING: Do NOT include companyId in the payload!
 */
export const createRoomTypeFacilityLink = async (
  payload: CreateRoomTypeFacilityLinkPayload
): Promise<RoomTypeFacilityLink> => {
  try {
    console.log('📤 Creating room type-facility link:', payload);
    
    const cleanPayload = { ...payload };
    if ('companyId' in cleanPayload) {
      console.warn('⚠️ Removing companyId from payload');
      delete (cleanPayload as any).companyId;
    }
    
    const response = await axiosClient.post<RoomTypeFacilityLink>(BASE_URL, cleanPayload);
    console.log('✅ Room type-facility link created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating room type-facility link:', error);
    throw error;
  }
};

/**
 * Remove facility from room type
 * DELETE /api/room-type-facilities/:roomTypeId/:facilityId
 */
export const deleteRoomTypeFacilityLink = async (
  roomTypeId: string,
  facilityId: string
): Promise<void> => {
  try {
    console.log('🗑️ Deleting room type-facility link:', roomTypeId, facilityId);
    await axiosClient.delete(`${BASE_URL}/${roomTypeId}/${facilityId}`);
    console.log('✅ Room type-facility link deleted successfully');
  } catch (error: any) {
    console.error('❌ Error deleting room type-facility link:', error);
    throw error;
  }
};

