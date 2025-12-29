/**
 * Tax Entity
 */
export interface Tax {
  id: string;                    // UUID (36 chars)
  companyId: number;             // Auto-set, don't send in requests
  propertyId: string;            // UUID, required
  title: string;                 // Required
  logic: string;                 // Tax logic: percent, per_room, per_room_per_night, per_person, per_person_per_night, per_night, per_booking
  type: string;                  // Tax type: tax, fee, city_tax
  rate: number;                  // Decimal (10,2), non-negative
  isInclusive: boolean;          // Default: false
  skipNights: number | null;     // Optional, positive integer (min: 1)
  maxNights: number | null;      // Optional, positive integer (min: 1)
  createdAt: string;             // ISO date string
  updatedAt: string;             // ISO date string
}

/**
 * Create Tax Request Payload
 */
export interface CreateTaxPayload {
  propertyId: string;            // UUID, required
  title: string;                 // Required
  logic: string;                 // Required, one of: percent, per_room, per_room_per_night, per_person, per_person_per_night, per_night, per_booking
  type: string;                  // Required, one of: tax, fee, city_tax
  rate: number;                  // Required, non-negative
  isInclusive?: boolean;         // Optional, default: false
  skipNights?: number;           // Optional, positive integer (min: 1)
  maxNights?: number;            // Optional, positive integer (min: 1)
}

/**
 * Update Tax Request Payload
 */
export interface UpdateTaxPayload {
  propertyId?: string;
  title?: string;
  logic?: string;                // One of: percent, per_room, per_room_per_night, per_person, per_person_per_night, per_night, per_booking
  type?: string;                 // One of: tax, fee, city_tax
  rate?: number;
  isInclusive?: boolean;
  skipNights?: number;
  maxNights?: number;
}

/**
 * Query parameters for fetching taxes
 */
export interface TaxQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

/**
 * Paginated response for taxes
 */
export interface PaginatedTaxesResponse {
  data: Tax[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

