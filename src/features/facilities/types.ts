/**
 * Facility types and interfaces
 * Facilities are amenities/features that can be associated with properties and room types
 */

export type Facility = {
  id: string; // UUID
  companyId: number;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Payload for creating a facility
 * 
 * ⚠️ CRITICAL: DO NOT include companyId, id, createdAt, or updatedAt
 * These are automatically handled by the backend:
 * - companyId: Extracted from JWT token
 * - id: Auto-generated UUID
 * - createdAt/updatedAt: Auto-generated timestamps
 * 
 * Including companyId will cause error: "property companyId should not exist"
 */
export type CreateFacilityPayload = {
  name: string;           // Required: 1-100 characters
  description?: string;   // Optional: HTML content, text length max 1000 characters
};

export type UpdateFacilityPayload = Partial<CreateFacilityPayload>;

export type PaginatedFacilitiesResponse = {
  data: Facility[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type FacilityQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
};

