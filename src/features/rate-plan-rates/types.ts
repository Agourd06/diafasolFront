/**
 * Rate Plan Rates Type Definitions
 * 
 * Rate plan rates define daily pricing for specific dates.
 * Each rate belongs to a rate plan and uses bigint ID.
 */

export interface RatePlanRate {
  id: number; // bigint
  companyId: number;
  propertyId: string; // UUID
  ratePlanId: string; // UUID
  date: string; // Date string (YYYY-MM-DD)
  rate: number; // Decimal (10,2), non-negative
}

/**
 * ⚠️ CRITICAL: When creating a rate plan rate, DO NOT include:
 * - id (auto-generated)
 * - companyId (automatically set from JWT token)
 * 
 * Note: The combination of propertyId + ratePlanId + date must be unique.
 * If you send companyId, you'll get: "companyId should not exist"
 */
export interface CreateRatePlanRatePayload {
  propertyId: string; // UUID, required
  ratePlanId: string; // UUID, required
  date: string; // Required, format: YYYY-MM-DD
  rate: number; // Required, non-negative
}

/**
 * ⚠️ CRITICAL: When updating a rate plan rate, DO NOT include:
 * - id (cannot be changed)
 * - companyId (cannot be changed)
 */
export interface UpdateRatePlanRatePayload {
  propertyId?: string; // UUID
  ratePlanId?: string; // UUID
  date?: string; // Format: YYYY-MM-DD
  rate?: number; // Non-negative
}

export interface PaginatedRatePlanRatesResponse {
  data: RatePlanRate[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RatePlanRateQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

