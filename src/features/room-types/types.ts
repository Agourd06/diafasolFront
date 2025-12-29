/**
 * Room Types Feature - Type Definitions
 * 
 * Room Types define different types of rooms within a property.
 * They are company-scoped and use UUID as primary key.
 */

export interface RoomType {
  id: string; // UUID
  propertyId: string; // UUID (FK to properties)
  companyId: number; // Auto-set from JWT token
  title: string; // Required
  countOfRooms: number; // Required, integer, min: 1
  occAdults: number; // Required, integer, min: 0
  occChildren: number; // Required, integer, min: 0
  occInfants: number; // Required, integer, min: 0
  defaultOccupancy: number; // Required, integer, min: 1
  roomKind?: string; // Optional, max 50 chars
  capacity?: number; // Optional, integer, min: 1
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  property?: {
    id: string;
    title: string;
  };
  company?: {
    id: number;
    name: string;
  };
}

/**
 * Payload for creating a new room type
 * 
 * ⚠️ CRITICAL: Do NOT include companyId, id, createdAt, or updatedAt
 * The companyId is automatically extracted from the JWT token
 */
export interface CreateRoomTypePayload {
  propertyId: string; // Required, UUID
  title: string; // Required
  countOfRooms: number; // Required, integer, min: 1
  occAdults: number; // Required, integer, min: 0
  occChildren: number; // Required, integer, min: 0
  occInfants: number; // Required, integer, min: 0
  defaultOccupancy: number; // Required, integer, min: 1
  roomKind?: string; // Optional, max 50 chars
  capacity?: number; // Optional, integer, min: 1
}

/**
 * Payload for updating an existing room type
 * All fields are optional
 */
export interface UpdateRoomTypePayload {
  title?: string;
  countOfRooms?: number;
  occAdults?: number;
  occChildren?: number;
  occInfants?: number;
  defaultOccupancy?: number;
  roomKind?: string;
  capacity?: number;
}

/**
 * Paginated response for room types
 */
export interface PaginatedRoomTypesResponse {
  data: RoomType[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Query parameters for fetching room types
 */
export interface RoomTypeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  propertyId?: string; // Filter by property ID
}

/**
 * Filter parameters for room types by property
 */
export interface RoomTypePropertyFilter {
  propertyId: string; // UUID
}

