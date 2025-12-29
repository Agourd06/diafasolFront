/**
 * Property Facilities Type Definitions
 * 
 * Property Facilities Links create relationships between properties and facilities.
 * This is a junction table (many-to-many relationship).
 */

export interface PropertyFacilityLink {
  propertyId: string; // UUID
  facilityId: string; // UUID
  companyId: number;
  createdAt: string;
  // Joined data (when included)
  property?: {
    id: string;
    title: string;
  };
  facility?: {
    id: string;
    name: string;
    description?: string;
  };
}

/**
 * ⚠️ CRITICAL: When creating property-facility link, DO NOT include:
 * - companyId (automatically set from JWT token)
 * - createdAt (auto-generated)
 */
export interface CreatePropertyFacilityLinkPayload {
  propertyId: string; // UUID, required
  facilityId: string; // UUID, required
}

export interface PaginatedPropertyFacilitiesResponse {
  data: PropertyFacilityLink[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PropertyFacilitiesQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string; // Valid: 'propertyId' or 'facilityId'
  sortOrder?: 'ASC' | 'DESC';
}

