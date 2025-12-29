/**
 * Rate Plan Options Type Definitions
 * 
 * Rate plan options define occupancy-based pricing for rate plans.
 * Each option belongs to a rate plan and uses bigint ID.
 */

export interface RatePlanOption {
  id: number; // bigint
  ratePlanId: string; // UUID
  companyId: number;
  occupancy: number; // Positive integer (min: 1)
  isPrimary: boolean; // Default: false
  rate: number; // Decimal (10,2), non-negative
}

/**
 * ⚠️ CRITICAL: When creating a rate plan option, DO NOT include:
 * - id (auto-generated)
 * - companyId (automatically set from JWT token)
 * 
 * If you send companyId, you'll get: "companyId should not exist"
 */
export interface CreateRatePlanOptionPayload {
  ratePlanId: string; // UUID, required
  occupancy: number; // Required, positive integer (min: 1)
  isPrimary?: boolean; // Optional, default: false
  rate: number; // Required, non-negative
}

/**
 * ⚠️ CRITICAL: When updating a rate plan option, DO NOT include:
 * - id (cannot be changed)
 * - companyId (cannot be changed)
 */
export interface UpdateRatePlanOptionPayload {
  ratePlanId?: string; // UUID
  occupancy?: number; // Positive integer (min: 1)
  isPrimary?: boolean;
  rate?: number; // Non-negative
}

export interface PaginatedRatePlanOptionsResponse {
  data: RatePlanOption[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RatePlanOptionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

