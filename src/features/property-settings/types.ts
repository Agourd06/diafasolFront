/**
 * Property Settings Type Definitions
 * 
 * Property Settings store configuration and business rules for properties.
 * Each property can have one settings record.
 */

export interface PropertySettings {
  propertyId: string; // UUID
  companyId: number;
  allowAvailabilityAutoupdateOnConfirmation?: boolean; // Stored as tinyint (0/1)
  allowAvailabilityAutoupdateOnModification?: boolean; // Stored as tinyint (0/1)
  allowAvailabilityAutoupdateOnCancellation?: boolean; // Stored as tinyint (0/1)
  minStayType?: string; // e.g., "nights"
  minPrice?: number; // decimal
  maxPrice?: number; // decimal
  stateLength?: number;
  cutOffTime?: string; // HH:MM:SS format
  cutOffDays?: number;
  maxDayAdvance?: number;
  createdAt: string;
  updatedAt: string;
  // Relation data (when included)
  property?: {
    id: string;
    title: string;
  };
}

/**
 * ⚠️ CRITICAL: When creating property settings, DO NOT include:
 * - companyId (automatically set from JWT token)
 * - createdAt (auto-generated)
 * - updatedAt (auto-generated)
 */
export interface CreatePropertySettingsPayload {
  propertyId: string; // UUID, required
  allowAvailabilityAutoupdateOnConfirmation?: boolean;
  allowAvailabilityAutoupdateOnModification?: boolean;
  allowAvailabilityAutoupdateOnCancellation?: boolean;
  minStayType?: string;
  minPrice?: number; // Send as number, not string
  maxPrice?: number; // Send as number, not string
  stateLength?: number;
  cutOffTime?: string; // HH:MM:SS format
  cutOffDays?: number;
  maxDayAdvance?: number;
}

/**
 * ⚠️ CRITICAL: When updating property settings, DO NOT include:
 * - propertyId (cannot be changed)
 * - companyId (cannot be changed)
 * - createdAt (cannot be changed)
 * - updatedAt (auto-updated)
 */
export interface UpdatePropertySettingsPayload {
  allowAvailabilityAutoupdateOnConfirmation?: boolean;
  allowAvailabilityAutoupdateOnModification?: boolean;
  allowAvailabilityAutoupdateOnCancellation?: boolean;
  minStayType?: string;
  minPrice?: number;
  maxPrice?: number;
  stateLength?: number;
  cutOffTime?: string;
  cutOffDays?: number;
  maxDayAdvance?: number;
}

export interface PaginatedPropertySettingsResponse {
  data: PropertySettings[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PropertySettingsQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string; // Valid: 'propertyId'
  sortOrder?: 'ASC' | 'DESC';
}

