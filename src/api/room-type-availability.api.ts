/**
 * Room Type Availability API Client
 * 
 * Handles all API calls for room type availability CRUD operations.
 */

import axiosClient from './axiosClient';
import type {
  RoomTypeAvailability,
  CreateRoomTypeAvailabilityPayload,
  UpdateRoomTypeAvailabilityPayload,
  PaginatedRoomTypeAvailabilityResponse,
  RoomTypeAvailabilityQueryParams,
  RoomTypeAvailabilityDateRange,
} from '@/features/room-type-availability/types';

const BASE_URL = '/room-type-availability';

/**
 * Get all room type availability records (paginated)
 * GET /api/room-type-availability
 */
export const getRoomTypeAvailability = async (
  params?: RoomTypeAvailabilityQueryParams
): Promise<PaginatedRoomTypeAvailabilityResponse> => {
  try {
    console.log('🔍 Fetching room type availability with params:', params);
    const response = await axiosClient.get<PaginatedRoomTypeAvailabilityResponse>(
      BASE_URL,
      { params }
    );
    console.log('✅ Room type availability fetched successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching room type availability:', error);
    throw error;
  }
};

/**
 * Search room type availability
 * GET /api/room-type-availability/search?q=<term>
 */
export const searchRoomTypeAvailability = async (query: string): Promise<RoomTypeAvailability[]> => {
  try {
    console.log('🔍 Searching room type availability with query:', query);
    const response = await axiosClient.get<RoomTypeAvailability[]>(
      `${BASE_URL}/search`,
      { params: { q: query } }
    );
    console.log('✅ Room type availability search completed:', response.data.length, 'results');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error searching room type availability:', error);
    throw error;
  }
};

/**
 * Get availability records by room type ID with pagination
 * GET /api/room-type-availability/room-type/:roomTypeId
 * 
 * Query Parameters (Optional):
 * - page (number) - Page number (default: 1)
 * - limit (number) - Items per page (default: 50)
 * - startDate (string) - Filter from date (YYYY-MM-DD)
 * - endDate (string) - Filter until date (YYYY-MM-DD)
 * - sortBy (string) - Field to sort by: date, availability, or id (default: date)
 * - sortOrder (string) - Sort order: ASC or DESC (default: ASC)
 */
export interface GetAvailabilityByRoomTypeParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'availability' | 'id';
  sortOrder?: 'ASC' | 'DESC';
}

export const getRoomTypeAvailabilityByRoomType = async (
  roomTypeId: string,
  params?: GetAvailabilityByRoomTypeParams
): Promise<RoomTypeAvailability[] | PaginatedRoomTypeAvailabilityResponse> => {
  try {
    console.log('🔍 Fetching availability for room type:', roomTypeId, 'with params:', params);
    const response = await axiosClient.get<any>(
      `${BASE_URL}/room-type/${roomTypeId}`,
      { params }
    );
    
    console.log('📦 Raw API response:', {
      type: typeof response.data,
      isArray: Array.isArray(response.data),
      hasData: !!response.data?.data,
      keys: response.data ? Object.keys(response.data) : [],
      fullResponse: JSON.stringify(response.data, null, 2).substring(0, 500),
    });
    
    // Handle different response formats
    // If pagination params are provided, return paginated response
    if (params?.page || params?.limit) {
      // Expect paginated response
      if (response.data?.data && Array.isArray(response.data.data) && response.data?.meta) {
        console.log('✅ Availability fetched for room type (paginated):', response.data.data.length, 'results');
        return response.data as PaginatedRoomTypeAvailabilityResponse;
      }
    }
    
    // Otherwise, handle as array response (backward compatibility)
    let availabilityArray: RoomTypeAvailability[] = [];
    
    if (Array.isArray(response.data)) {
      // Direct array response
      availabilityArray = response.data;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      // Paginated response with data array (but no pagination params, so return just array)
      availabilityArray = response.data.data;
    } else if (response.data?.values && Array.isArray(response.data.values)) {
      // Channex grouped format (shouldn't happen here, but handle it)
      console.warn('⚠️ Received grouped format instead of array, extracting values');
      availabilityArray = response.data.values;
    } else {
      // Unknown format, try to extract array from response
      console.warn('⚠️ Unknown response format, attempting to extract array');
      const possibleArray = Object.values(response.data).find(
        (val: any) => Array.isArray(val)
      ) as RoomTypeAvailability[] | undefined;
      
      if (possibleArray) {
        availabilityArray = possibleArray;
      } else {
        console.error('❌ Could not extract array from response:', response.data);
        throw new Error('Invalid response format: expected array or paginated response');
      }
    }
    
    console.log('✅ Availability fetched for room type:', availabilityArray.length, 'results');
    return availabilityArray;
  } catch (error: any) {
    console.error('❌ Error fetching availability by room type:', error);
    throw error;
  }
};

/**
 * Get availability records by date range
 * GET /api/room-type-availability/date-range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
export const getRoomTypeAvailabilityByDateRange = async (
  dateRange: RoomTypeAvailabilityDateRange
): Promise<RoomTypeAvailability[]> => {
  try {
    console.log('🔍 Fetching availability for date range:', dateRange);
    const response = await axiosClient.get<any>(
      `${BASE_URL}/date-range`,
      { params: dateRange }
    );
    
    console.log('📦 Raw date range API response:', {
      type: typeof response.data,
      isArray: Array.isArray(response.data),
      hasData: !!response.data?.data,
      keys: response.data ? Object.keys(response.data) : [],
    });
    
    // Handle different response formats
    let availabilityArray: RoomTypeAvailability[] = [];
    
    if (Array.isArray(response.data)) {
      // Direct array response
      availabilityArray = response.data;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      // Paginated response with data array
      availabilityArray = response.data.data;
    } else if (response.data?.values && Array.isArray(response.data.values)) {
      // Channex grouped format (shouldn't happen here, but handle it)
      console.warn('⚠️ Received grouped format instead of array, extracting values');
      availabilityArray = response.data.values;
    } else {
      // Unknown format, try to extract array from response
      console.warn('⚠️ Unknown response format, attempting to extract array');
      const possibleArray = Object.values(response.data).find(
        (val: any) => Array.isArray(val)
      ) as RoomTypeAvailability[] | undefined;
      
      if (possibleArray) {
        availabilityArray = possibleArray;
      } else {
        console.error('❌ Could not extract array from response:', response.data);
        throw new Error('Invalid response format: expected array or paginated response');
      }
    }
    
    console.log('✅ Availability fetched for date range:', availabilityArray.length, 'results');
    return availabilityArray;
  } catch (error: any) {
    console.error('❌ Error fetching availability by date range:', error);
    throw error;
  }
};

/**
 * Get a single availability record by ID
 * GET /api/room-type-availability/:id
 */
export const getRoomTypeAvailabilityById = async (id: number): Promise<RoomTypeAvailability> => {
  try {
    console.log('🔍 Fetching availability by ID:', id);
    const response = await axiosClient.get<RoomTypeAvailability>(`${BASE_URL}/${id}`);
    console.log('✅ Availability fetched:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching availability:', error);
    throw error;
  }
};

/**
 * Create a new availability record
 * POST /api/room-type-availability
 * 
 * ⚠️ WARNING: Do NOT include companyId in the payload!
 * The companyId is automatically extracted from the JWT token.
 */
export const createRoomTypeAvailability = async (
  payload: CreateRoomTypeAvailabilityPayload
): Promise<RoomTypeAvailability> => {
  try {
    console.log('📤 Creating room type availability:', payload);
    
    // Ensure companyId is NOT in the payload
    const cleanPayload = { ...payload };
    if ('companyId' in cleanPayload) {
      console.warn('⚠️ Removing companyId from payload - it is auto-set from JWT token');
      delete (cleanPayload as any).companyId;
    }
    
    const response = await axiosClient.post<RoomTypeAvailability>(BASE_URL, cleanPayload);
    console.log('✅ Room type availability created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating room type availability:', error);
    throw error;
  }
};

/**
 * Update an existing availability record
 * PATCH /api/room-type-availability/:id
 */
export const updateRoomTypeAvailability = async (
  id: number,
  payload: UpdateRoomTypeAvailabilityPayload
): Promise<RoomTypeAvailability> => {
  try {
    console.log('📤 Updating room type availability:', id, payload);
    const response = await axiosClient.patch<RoomTypeAvailability>(
      `${BASE_URL}/${id}`,
      payload
    );
    console.log('✅ Room type availability updated successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating room type availability:', error);
    throw error;
  }
};

/**
 * Delete an availability record
 * DELETE /api/room-type-availability/:id
 */
export const deleteRoomTypeAvailability = async (id: number): Promise<void> => {
  try {
    console.log('🗑️ Deleting room type availability:', id);
    await axiosClient.delete(`${BASE_URL}/${id}`);
    console.log('✅ Room type availability deleted successfully');
  } catch (error: any) {
    console.error('❌ Error deleting room type availability:', error);
    throw error;
  }
};

/**
 * Generate yearly availability for a room type
 * POST /api/room-type-availability/room-type/:roomTypeId/generate-yearly
 * 
 * Automatically generates 365 days of availability starting from today.
 * Uses the room type's countOfRooms as the base availability value.
 */
export interface GenerateYearlyAvailabilityResponse {
  message: string;
  count: number;
  roomTypeId: string;
  baseAvailability: number;
}

export const generateYearlyAvailability = async (
  roomTypeId: string
): Promise<GenerateYearlyAvailabilityResponse> => {
  const response = await axiosClient.post<GenerateYearlyAvailabilityResponse>(
    `${BASE_URL}/room-type/${roomTypeId}/generate-yearly`,
    {}
  );
  return response.data;
};

/**
 * Get grouped availability for Channex sync
 * GET /api/room-type-availability/room-type/:roomTypeId/channex-grouped
 * 
 * Returns availability grouped by consecutive dates with same availability, formatted for Channex API.
 * 
 * Query Parameters (Optional):
 * - startDate (string) - Filter from date (YYYY-MM-DD)
 * - endDate (string) - Filter until date (YYYY-MM-DD)
 */
export interface ChannexAvailabilityRange {
  property_id: string;
  room_type_id: string;
  date_from: string;
  date_to: string;
  availability: number;
}

export interface GroupedAvailabilityResponse {
  values: ChannexAvailabilityRange[];
}

export interface GetGroupedAvailabilityParams {
  startDate?: string;
  endDate?: string;
}

export const getGroupedAvailabilityForChannex = async (
  roomTypeId: string,
  params?: GetGroupedAvailabilityParams
): Promise<GroupedAvailabilityResponse> => {
  const response = await axiosClient.get<GroupedAvailabilityResponse>(
    `${BASE_URL}/room-type/${roomTypeId}/channex-grouped`,
    { params }
  );
  
  // Log the raw backend response for debugging
  console.log('📦 Backend grouped availability response:', {
    roomTypeId,
    params,
    totalRanges: response.data.values?.length || 0,
    ranges: response.data.values?.map(r => ({
      date_from: r.date_from,
      date_to: r.date_to,
      availability: r.availability,
      property_id: r.property_id,
      room_type_id: r.room_type_id,
    })),
    fullResponse: JSON.stringify(response.data, null, 2),
  });
  
  return response.data;
};

