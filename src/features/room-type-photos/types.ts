/**
 * Room Type Photos Feature - Type Definitions
 * 
 * Manages photo galleries for room types.
 */

export interface RoomTypePhoto {
  id: string; // UUID
  companyId: number; // Auto-set from JWT token
  propertyId: string; // UUID (FK to properties)
  roomTypeId: string; // UUID (FK to room_types)
  url: string; // Required, valid URL
  position?: number; // Optional, integer, min: 0
  author?: string; // Optional, max 255 chars
  kind?: string; // Optional, max 50 chars
  description?: string; // Optional, text
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  roomType?: {
    id: string;
    title: string;
  };
  property?: {
    id: string;
    title: string;
  };
}

/**
 * Payload for creating a new room type photo
 * 
 * ⚠️ CRITICAL: Do NOT include companyId or id
 */
export interface CreateRoomTypePhotoPayload {
  propertyId: string; // Required, UUID
  roomTypeId: string; // Required, UUID
  url: string; // Required, valid URL
  position?: number; // Optional, integer, min: 0
  author?: string; // Optional, max 255 chars
  kind?: string; // Optional, max 50 chars
  description?: string; // Optional, text
}

/**
 * Payload for updating an existing room type photo
 */
export interface UpdateRoomTypePhotoPayload {
  url?: string;
  position?: number;
  author?: string;
  kind?: string;
  description?: string;
}

/**
 * Paginated response for room type photos
 */
export interface PaginatedRoomTypePhotosResponse {
  data: RoomTypePhoto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Query parameters for fetching room type photos
 */
export interface RoomTypePhotoQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

