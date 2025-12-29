/**
 * Property Photos Type Definitions
 * 
 * Property Photos store images/URLs for properties.
 * Each property can have multiple photos.
 */

export interface PropertyPhoto {
  id: number; // Numeric ID (not UUID)
  propertyId: string; // UUID
  companyId: number;
  url: string; // Required, image URL
  position?: number; // Optional, for ordering
  author?: string; // Optional, photo author/credit
  kind?: string; // Optional, e.g., "exterior", "interior", "room", "amenity"
  description?: string; // Optional, text description
  createdAt: string;
  updatedAt: string;
  // Relation data (when included)
  property?: {
    id: string;
    title: string;
  };
}

/**
 * ⚠️ CRITICAL: When creating property photo, DO NOT include:
 * - id (auto-generated numeric ID)
 * - companyId (automatically set from JWT token)
 * - createdAt (auto-generated)
 * - updatedAt (auto-generated)
 */
export interface CreatePropertyPhotoPayload {
  propertyId: string; // UUID, required
  url: string; // Required
  position?: number; // Send as number, not string
  author?: string;
  kind?: string;
  description?: string;
}

/**
 * ⚠️ CRITICAL: When updating property photo, DO NOT include:
 * - id (cannot be changed)
 * - propertyId (cannot be changed)
 * - companyId (cannot be changed)
 * - createdAt (cannot be changed)
 * - updatedAt (auto-updated)
 */
export interface UpdatePropertyPhotoPayload {
  url?: string;
  position?: number; // Send as number, not string
  author?: string;
  kind?: string;
  description?: string;
}

export interface PaginatedPropertyPhotosResponse {
  data: PropertyPhoto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PropertyPhotosQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string; // Valid: 'id', 'position', 'propertyId'
  sortOrder?: 'ASC' | 'DESC';
  search?: string; // Searches in url, description, author, kind
}

