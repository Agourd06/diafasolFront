/**
 * Room Type Content Feature - Type Definitions
 * 
 * Manages descriptions and additional content for room types.
 */

export interface RoomTypeContent {
  roomTypeId: string; // UUID (primary key, FK to room_types)
  companyId: number; // Auto-set from JWT token
  description?: string; // Optional, text (HTML)
  roomType?: {
    id: string;
    title: string;
  };
}

/**
 * Payload for creating new room type content
 * 
 * ⚠️ CRITICAL: Do NOT include companyId
 * The companyId is automatically extracted from the JWT token
 */
export interface CreateRoomTypeContentPayload {
  roomTypeId: string; // Required, UUID
  description?: string; // Optional, text (HTML)
}

/**
 * Payload for updating existing room type content
 */
export interface UpdateRoomTypeContentPayload {
  description?: string; // Optional, text (HTML)
}

/**
 * Paginated response for room type content
 */
export interface PaginatedRoomTypeContentResponse {
  data: RoomTypeContent[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Query parameters for fetching room type content
 */
export interface RoomTypeContentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

