/**
 * Room Type Facilities Feature - Type Definitions
 * 
 * Manages many-to-many relationships between room types and facilities.
 */

export interface RoomTypeFacilityLink {
  roomTypeId: string; // UUID (primary key, FK to room_types)
  facilityId: string; // UUID (primary key, FK to facilities)
  roomType?: {
    id: string;
    title: string;
  };
  facility?: {
    id: string;
    name: string;
  };
}

/**
 * Payload for creating a new room type-facility link
 * 
 * ⚠️ CRITICAL: Do NOT include companyId
 * The companyId is automatically extracted from the JWT token
 */
export interface CreateRoomTypeFacilityLinkPayload {
  roomTypeId: string; // Required, UUID
  facilityId: string; // Required, UUID
}

/**
 * Paginated response for room type facilities
 */
export interface PaginatedRoomTypeFacilityLinksResponse {
  data: RoomTypeFacilityLink[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Query parameters for fetching room type facilities
 */
export interface RoomTypeFacilityLinkQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

