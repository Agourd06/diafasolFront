/**
 * Room Type Availability Feature - Type Definitions
 * 
 * Manages daily availability calendar for room types.
 */

export interface RoomTypeAvailability {
  id: number; // bigint (auto-generated)
  companyId: number; // Auto-set from JWT token
  propertyId: string; // UUID (FK to properties)
  roomTypeId: string; // UUID (FK to room_types)
  date: string; // Date format: YYYY-MM-DD
  availability: number; // Integer, min: 0
  property?: {
    id: string;
    title: string;
  };
  roomType?: {
    id: string;
    title: string;
  };
}

/**
 * Payload for creating a new availability record
 * 
 * ⚠️ CRITICAL: Do NOT include companyId or id
 * The companyId is automatically extracted from the JWT token
 */
export interface CreateRoomTypeAvailabilityPayload {
  propertyId: string; // Required, UUID
  roomTypeId: string; // Required, UUID
  date: string; // Required, format: YYYY-MM-DD
  availability: number; // Required, integer, min: 0
}

/**
 * Payload for updating an existing availability record
 */
export interface UpdateRoomTypeAvailabilityPayload {
  availability: number; // Required, integer, min: 0
}

/**
 * Paginated response for room type availability
 */
export interface PaginatedRoomTypeAvailabilityResponse {
  data: RoomTypeAvailability[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Query parameters for fetching availability
 */
export interface RoomTypeAvailabilityQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Date range filter for availability
 */
export interface RoomTypeAvailabilityDateRange {
  startDate: string; // Format: YYYY-MM-DD
  endDate: string; // Format: YYYY-MM-DD
}

