/**
 * Property Content Type Definitions
 * 
 * Property Content stores descriptions and important information for properties.
 * Each property can have one content record.
 */

export interface PropertyContent {
  propertyId: string; // UUID
  companyId: number;
  description?: string; // Text content
  importantInformation?: string; // Text content
  createdAt: string;
  updatedAt: string;
  // Relation data (when included)
  property?: {
    id: string;
    title: string;
  };
}

/**
 * ⚠️ CRITICAL: When creating property content, DO NOT include:
 * - companyId (automatically set from JWT token)
 * - createdAt (auto-generated)
 * - updatedAt (auto-generated)
 */
export interface CreatePropertyContentPayload {
  propertyId: string; // UUID, required
  description?: string;
  importantInformation?: string;
}

/**
 * ⚠️ CRITICAL: When updating property content, DO NOT include:
 * - propertyId (cannot be changed)
 * - companyId (cannot be changed)
 * - createdAt (cannot be changed)
 * - updatedAt (auto-updated)
 */
export interface UpdatePropertyContentPayload {
  description?: string;
  importantInformation?: string;
}

export interface PaginatedPropertyContentResponse {
  data: PropertyContent[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PropertyContentQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string; // Searches in description and importantInformation
}

