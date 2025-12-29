/**
 * Rate Plan Period Rules Type Definitions
 * 
 * Period rules define date-range based restrictions for rate plans.
 * Each rule belongs to a rate plan and uses bigint ID.
 */

export interface RatePlanPeriodRule {
  id: number; // bigint
  ratePlanId: string; // UUID
  companyId: number;
  startDate: string; // Date string (YYYY-MM-DD)
  endDate: string; // Date string (YYYY-MM-DD)
  maxStay?: number | null;
  minStayArrival?: number | null;
  minStayThrough?: number | null;
  closedToArrival: boolean;
  closedToDeparture: boolean;
  stopSell: boolean;
}

/**
 * ⚠️ CRITICAL: When creating a period rule, DO NOT include:
 * - id (auto-generated)
 * - companyId (automatically set from JWT token)
 * 
 * If you send companyId, you'll get: "companyId should not exist"
 */
export interface CreateRatePlanPeriodRulePayload {
  ratePlanId: string; // UUID, required
  startDate: string; // Required, format: YYYY-MM-DD
  endDate: string; // Required, format: YYYY-MM-DD
  maxStay?: number | null;
  minStayArrival?: number | null;
  minStayThrough?: number | null;
  closedToArrival: boolean; // Required
  closedToDeparture: boolean; // Required
  stopSell: boolean; // Required
}

/**
 * ⚠️ CRITICAL: When updating a period rule, DO NOT include:
 * - id (cannot be changed)
 * - companyId (cannot be changed)
 */
export interface UpdateRatePlanPeriodRulePayload {
  ratePlanId?: string; // UUID
  startDate?: string; // Format: YYYY-MM-DD
  endDate?: string; // Format: YYYY-MM-DD
  maxStay?: number | null;
  minStayArrival?: number | null;
  minStayThrough?: number | null;
  closedToArrival?: boolean;
  closedToDeparture?: boolean;
  stopSell?: boolean;
}

export interface PaginatedRatePlanPeriodRulesResponse {
  data: RatePlanPeriodRule[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RatePlanPeriodRuleQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

