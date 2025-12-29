/**
 * Rate Plan Auto Rate Settings Type Definitions
 * 
 * Auto rate settings define key/value pairs for derived pricing rules.
 * Each setting belongs to a rate plan and uses bigint ID.
 */

export interface RatePlanAutoRateSetting {
  id: number; // bigint
  ratePlanId: string; // UUID
  companyId: number;
  ruleName: string; // Key name
  ruleValue: string; // Value
}

/**
 * ⚠️ CRITICAL: When creating an auto rate setting, DO NOT include:
 * - id (auto-generated)
 * - companyId (automatically set from JWT token)
 * 
 * If you send companyId, you'll get: "companyId should not exist"
 */
export interface CreateRatePlanAutoRateSettingPayload {
  ratePlanId: string; // UUID, required
  ruleName: string; // Required
  ruleValue: string; // Required
}

/**
 * ⚠️ CRITICAL: When updating an auto rate setting, DO NOT include:
 * - id (cannot be changed)
 * - companyId (cannot be changed)
 */
export interface UpdateRatePlanAutoRateSettingPayload {
  ratePlanId?: string; // UUID
  ruleName?: string;
  ruleValue?: string;
}

export interface PaginatedRatePlanAutoRateSettingsResponse {
  data: RatePlanAutoRateSetting[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RatePlanAutoRateSettingQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

