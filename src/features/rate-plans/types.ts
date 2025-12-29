/**
 * Rate Plans Type Definitions
 * 
 * Rate plans define pricing strategies for room types.
 * Each rate plan belongs to a company and uses UUID as primary key.
 */

import type { RatePlanDailyRule } from '@/features/rate-plan-daily-rules/types';
import type { RatePlanPeriodRule } from '@/features/rate-plan-period-rules/types';
import type { RatePlanAutoRateSetting } from '@/features/rate-plan-auto-rate-settings/types';

export interface RatePlan {
  id: string; // UUID (36 characters)
  companyId: number;
  title: string;
  propertyId: string; // UUID
  roomTypeId: string; // UUID
  taxSetId: string; // UUID (backend field; currently we pass selected tax here)
  parentRatePlanId?: string; // UUID, optional (for inheritance)
  childrenFee: number; // Decimal (10,2)
  infantFee: number; // Decimal (10,2)
  currency: string; // ISO 4217 currency code (exactly 3 uppercase letters: USD, EUR, GBP, etc.)
  sellMode: string; // Max 50 chars
  rateMode: string; // Max 50 chars
  inheritRate?: boolean; // Default: false
  inheritClosedToArrival?: boolean; // Default: false
  inheritClosedToDeparture?: boolean; // Default: false
  inheritStopSell?: boolean; // Default: false
  inheritMinStayArrival?: boolean; // Default: false
  inheritMinStayThrough?: boolean; // Default: false
  inheritMaxStay?: boolean; // Default: false
  inheritMaxSell?: boolean; // Default: false
  inheritMaxAvailability?: boolean; // Default: false
  inheritAvailabilityOffset?: boolean; // Default: false
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  // Relational fields
  dailyRules?: RatePlanDailyRule[]; // Weekday-based restrictions
  periodRules?: RatePlanPeriodRule[]; // Date-range restrictions
  autoRateSettingsRelations?: RatePlanAutoRateSetting[]; // Derived pricing settings
}

/**
 * ⚠️ CRITICAL: When creating a rate plan, DO NOT include:
 * - companyId (automatically set from JWT token)
 * - id (auto-generated UUID)
 * - createdAt (auto-generated)
 * - updatedAt (auto-generated)
 * 
 * If you send companyId, you'll get: "companyId should not exist"
 */
export interface CreateRatePlanPayload {
  title: string; // Required
  propertyId: string; // UUID, required
  roomTypeId: string; // UUID, required
  taxSetId: string; // UUID, required (backend expects taxSetId; we send selected tax id here)
  parentRatePlanId?: string; // UUID, optional
  childrenFee: number; // Required, non-negative
  infantFee: number; // Required, non-negative
  currency: string; // Required, ISO 4217 currency code (exactly 3 uppercase letters)
  sellMode: string; // Required, max 50 chars
  rateMode: string; // Required, max 50 chars
  inheritRate?: boolean;
  inheritClosedToArrival?: boolean;
  inheritClosedToDeparture?: boolean;
  inheritStopSell?: boolean;
  inheritMinStayArrival?: boolean;
  inheritMinStayThrough?: boolean;
  inheritMaxStay?: boolean;
  inheritMaxSell?: boolean;
  inheritMaxAvailability?: boolean;
  inheritAvailabilityOffset?: boolean;
}

/**
 * ⚠️ CRITICAL: When updating a rate plan, DO NOT include:
 * - companyId (cannot be changed)
 * - id (cannot be changed)
 * - createdAt (cannot be changed)
 * - updatedAt (auto-updated)
 */
export interface UpdateRatePlanPayload {
  title?: string;
  propertyId?: string; // UUID
  roomTypeId?: string; // UUID
  taxSetId?: string; // UUID
  parentRatePlanId?: string; // UUID
  childrenFee?: number;
  infantFee?: number;
  currency?: string; // ISO 4217 currency code (exactly 3 uppercase letters)
  sellMode?: string;
  rateMode?: string;
  inheritRate?: boolean;
  inheritClosedToArrival?: boolean;
  inheritClosedToDeparture?: boolean;
  inheritStopSell?: boolean;
  inheritMinStayArrival?: boolean;
  inheritMinStayThrough?: boolean;
  inheritMaxStay?: boolean;
  inheritMaxSell?: boolean;
  inheritMaxAvailability?: boolean;
  inheritAvailabilityOffset?: boolean;
}

export interface PaginatedRatePlansResponse {
  data: RatePlan[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RatePlanQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  roomTypeId?: string; // Filter by room type ID
}

