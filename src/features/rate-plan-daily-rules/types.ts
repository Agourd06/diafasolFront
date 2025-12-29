/**
 * Rate Plan Daily Rules Type Definitions
 * 
 * Daily rules define weekday-based restrictions for rate plans.
 * Each rule belongs to a rate plan and uses bigint ID.
 */

export interface RatePlanDailyRule {
  id: number; // bigint
  ratePlanId: string; // UUID
  companyId: number;
  weekday: 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1=Monday, 7=Sunday
  maxStay?: number | null;
  minStayArrival?: number | null;
  minStayThrough?: number | null;
  closedToArrival: boolean;
  closedToDeparture: boolean;
  stopSell: boolean;
}

/**
 * ⚠️ CRITICAL: When creating a daily rule, DO NOT include:
 * - id (auto-generated)
 * - companyId (automatically set from JWT token)
 * 
 * If you send companyId, you'll get: "companyId should not exist"
 */
export interface CreateRatePlanDailyRulePayload {
  ratePlanId: string; // UUID, required
  weekday: 1 | 2 | 3 | 4 | 5 | 6 | 7; // Required
  maxStay?: number | null;
  minStayArrival?: number | null;
  minStayThrough?: number | null;
  closedToArrival: boolean; // Required
  closedToDeparture: boolean; // Required
  stopSell: boolean; // Required
}

/**
 * ⚠️ CRITICAL: When updating a daily rule, DO NOT include:
 * - id (cannot be changed)
 * - companyId (cannot be changed)
 */
export interface UpdateRatePlanDailyRulePayload {
  ratePlanId?: string; // UUID
  weekday?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  maxStay?: number | null;
  minStayArrival?: number | null;
  minStayThrough?: number | null;
  closedToArrival?: boolean;
  closedToDeparture?: boolean;
  stopSell?: boolean;
}

export interface PaginatedRatePlanDailyRulesResponse {
  data: RatePlanDailyRule[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RatePlanDailyRuleQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

