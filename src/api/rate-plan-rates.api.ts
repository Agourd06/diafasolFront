/**
 * Rate Plan Rates API Client
 * 
 * All endpoints require authentication (JWT token in Authorization header).
 * The companyId is automatically extracted from the token.
 */

import axiosClient from './axiosClient';
import type {
  RatePlanRate,
  CreateRatePlanRatePayload,
  UpdateRatePlanRatePayload,
  PaginatedRatePlanRatesResponse,
  RatePlanRateQueryParams,
} from '@/features/rate-plan-rates/types';

const BASE_URL = '/rate-plan-rates';

/**
 * Get all rate plan rates (paginated)
 * GET /api/rate-plan-rates
 */
export const getRatePlanRates = async (
  params?: RatePlanRateQueryParams
): Promise<PaginatedRatePlanRatesResponse> => {
  try {
    console.log('🔍 Fetching rate plan rates with params:', params);
    const response = await axiosClient.get<PaginatedRatePlanRatesResponse>(
      BASE_URL,
      { params }
    );
    console.log('✅ Rate plan rates fetched successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching rate plan rates:', error);
    throw error;
  }
};

/**
 * Search rate plan rates
 * GET /api/rate-plan-rates/search?q=term
 */
export const searchRatePlanRates = async (searchTerm: string): Promise<RatePlanRate[]> => {
  const response = await axiosClient.get<RatePlanRate[]>(`${BASE_URL}/search`, {
    params: { q: searchTerm },
  });
  return response.data;
};

/**
 * Get rates by rate plan with pagination and date filtering
 * GET /api/rate-plan-rates/rate-plan/:ratePlanId
 * 
 * Query Parameters:
 * - page (number, optional) - Page number (default: 1)
 * - limit (number, optional) - Items per page (default: 50, max: 100)
 * - startDate (string, optional) - Filter rates from this date (YYYY-MM-DD)
 * - endDate (string, optional) - Filter rates until this date (YYYY-MM-DD)
 * - sortBy (string, optional) - Field to sort by: date, rate, or id (default: date)
 * - sortOrder (string, optional) - Sort order: ASC or DESC (default: ASC)
 */
export interface GetRatesByRatePlanParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'rate' | 'id';
  sortOrder?: 'ASC' | 'DESC';
}

export const getRatesByRatePlan = async (
  ratePlanId: string,
  params?: GetRatesByRatePlanParams
): Promise<PaginatedRatePlanRatesResponse> => {
  const response = await axiosClient.get<PaginatedRatePlanRatesResponse>(
    `${BASE_URL}/rate-plan/${ratePlanId}`,
    { params }
  );
  return response.data;
};

/**
 * Get rates by date range
 * GET /api/rate-plan-rates/date-range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
export const getRatesByDateRange = async (
  startDate: string,
  endDate: string
): Promise<RatePlanRate[]> => {
  const response = await axiosClient.get<RatePlanRate[]>(`${BASE_URL}/date-range`, {
    params: { startDate, endDate },
  });
  return response.data;
};

/**
 * Get rate plan rate by ID
 * GET /api/rate-plan-rates/:id
 */
export const getRatePlanRateById = async (id: number): Promise<RatePlanRate> => {
  const response = await axiosClient.get<RatePlanRate>(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * Create rate plan rate
 * POST /api/rate-plan-rates
 * 
 * ⚠️ CRITICAL: DO NOT send companyId in the payload!
 * The companyId is automatically extracted from your JWT token.
 * 
 * Note: The combination of propertyId + ratePlanId + date must be unique.
 */
export const createRatePlanRate = async (
  payload: CreateRatePlanRatePayload
): Promise<RatePlanRate> => {
  const response = await axiosClient.post<RatePlanRate>(BASE_URL, payload);
  return response.data;
};

/**
 * Update rate plan rate
 * PATCH /api/rate-plan-rates/:id
 * 
 * ⚠️ CRITICAL: DO NOT send companyId or id in the payload!
 */
export const updateRatePlanRate = async (
  id: number,
  payload: UpdateRatePlanRatePayload
): Promise<RatePlanRate> => {
  const response = await axiosClient.patch<RatePlanRate>(`${BASE_URL}/${id}`, payload);
  return response.data;
};

/**
 * Delete rate plan rate
 * DELETE /api/rate-plan-rates/:id
 */
export const deleteRatePlanRate = async (id: number): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};

/**
 * Generate yearly rates for a rate plan
 * POST /api/rate-plan-rates/rate-plan/:ratePlanId/generate-yearly
 * 
 * Automatically generates 365 days of rates starting from today.
 * All required data is automatically fetched and populated.
 */
export interface GenerateYearlyRatesResponse {
  message: string;
  count: number;
  ratePlanId: string;
  baseRate: number;
}

export const generateYearlyRates = async (
  ratePlanId: string
): Promise<GenerateYearlyRatesResponse> => {
  const response = await axiosClient.post<GenerateYearlyRatesResponse>(
    `${BASE_URL}/rate-plan/${ratePlanId}/generate-yearly`,
    {}
  );
  return response.data;
};

/**
 * Get grouped rates for Channex sync
 * GET /api/rate-plan-rates/rate-plan/:ratePlanId/channex-grouped
 * 
 * Returns rates grouped by consecutive dates with same rate, formatted for Channex API.
 * 
 * Query Parameters (Optional):
 * - startDate (string) - Filter from date (YYYY-MM-DD)
 * - endDate (string) - Filter until date (YYYY-MM-DD)
 */
export interface ChannexRateRange {
  property_id: string;
  rate_plan_id: string;
  date_from: string;
  date_to: string;
  rate: number;
}

export interface GroupedRatesResponse {
  values: ChannexRateRange[];
}

export interface GetGroupedRatesParams {
  startDate?: string;
  endDate?: string;
}

export const getGroupedRatesForChannex = async (
  ratePlanId: string,
  params?: GetGroupedRatesParams
): Promise<GroupedRatesResponse> => {
  const response = await axiosClient.get<GroupedRatesResponse>(
    `${BASE_URL}/rate-plan/${ratePlanId}/channex-grouped`,
    { params }
  );
  
  // Log the raw backend response for debugging
  console.log('📦 Backend grouped rates response:', {
    ratePlanId,
    params,
    totalRanges: response.data.values?.length || 0,
    ranges: response.data.values?.map(r => ({
      date_from: r.date_from,
      date_to: r.date_to,
      rate: r.rate,
      property_id: r.property_id,
      rate_plan_id: r.rate_plan_id,
    })),
    fullResponse: JSON.stringify(response.data, null, 2),
  });

  // Check if a specific date is in any range
  const checkDate = '2025-12-30';
  const dateIncluded = response.data.values?.some(range => {
    const fromDate = new Date(range.date_from);
    const toDate = new Date(range.date_to);
    const checkDateObj = new Date(checkDate);
    return checkDateObj >= fromDate && checkDateObj <= toDate;
  });
  console.log(`📅 Date ${checkDate} included in backend response:`, dateIncluded);
  if (!dateIncluded) {
    console.warn(`⚠️ Date ${checkDate} is NOT in backend grouped rates response!`);
  }
  
  return response.data;
};

