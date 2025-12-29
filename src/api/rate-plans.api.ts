/**
 * Rate Plans API Client
 * 
 * All endpoints require authentication (JWT token in Authorization header).
 * The companyId is automatically extracted from the token.
 */

import axiosClient from './axiosClient';
import type {
  RatePlan,
  CreateRatePlanPayload,
  UpdateRatePlanPayload,
  PaginatedRatePlansResponse,
  RatePlanQueryParams,
} from '@/features/rate-plans/types';

const BASE_URL = '/rate-plans';

/**
 * Get all rate plans (paginated)
 * GET /api/rate-plans
 */
export const getRatePlans = async (
  params?: RatePlanQueryParams
): Promise<PaginatedRatePlansResponse> => {
  try {
    console.log('🔍 Fetching rate plans with params:', params);
    const response = await axiosClient.get<PaginatedRatePlansResponse>(
      BASE_URL,
      { params }
    );
    console.log('✅ Rate plans fetched successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching rate plans:', error);
    throw error;
  }
};

/**
 * Search rate plans
 * GET /api/rate-plans/search?q=term
 */
export const searchRatePlans = async (searchTerm: string): Promise<RatePlan[]> => {
  const response = await axiosClient.get<RatePlan[]>(`${BASE_URL}/search`, {
    params: { q: searchTerm },
  });
  return response.data;
};

/**
 * Get rate plans by property
 * GET /api/rate-plans/property/:propertyId
 */
export const getRatePlansByProperty = async (propertyId: string): Promise<RatePlan[]> => {
  const response = await axiosClient.get<RatePlan[]>(`${BASE_URL}/property/${propertyId}`);
  return response.data;
};

/**
 * Get rate plans by room type
 * GET /api/rate-plans/room-type/:roomTypeId
 */
export const getRatePlansByRoomType = async (roomTypeId: string): Promise<RatePlan[]> => {
  const response = await axiosClient.get<RatePlan[]>(`${BASE_URL}/room-type/${roomTypeId}`);
  return response.data;
};

/**
 * Get rate plan by ID
 * GET /api/rate-plans/:id
 */
export const getRatePlanById = async (id: string): Promise<RatePlan> => {
  const response = await axiosClient.get<RatePlan>(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * Get rate plan with all Channex sync data
 * GET /api/rate-plans/:id/channex-sync
 * 
 * Returns complete rate plan data including:
 * - All rate plan fields
 * - Options (REQUIRED for Channex)
 * - Daily rules (for building weekday arrays)
 * - Auto rate settings (if rate_mode = 'auto')
 * 
 * This endpoint is optimized for Channex synchronization and includes
 * all necessary data in a single query to avoid multiple API calls.
 */
export const getRatePlanForChannexSync = async (id: string): Promise<import('@/types/rate-plan-channex-sync').RatePlanForChannexSync> => {
  const response = await axiosClient.get<any>(`${BASE_URL}/${id}/channex-sync`);
  
  // Transform daily rules: convert 1/0 to true/false for boolean fields
  // Handle both camelCase and snake_case field names from backend
  if (response.data.daily_rules && Array.isArray(response.data.daily_rules)) {
    response.data.daily_rules = response.data.daily_rules.map((rule: any) => {
      // Get value from either camelCase or snake_case field
      const closedToArrivalValue = rule.closedToArrival !== undefined ? rule.closedToArrival : rule.closed_to_arrival;
      const closedToDepartureValue = rule.closedToDeparture !== undefined ? rule.closedToDeparture : rule.closed_to_departure;
      const stopSellValue = rule.stopSell !== undefined ? rule.stopSell : rule.stop_sell;
      
      // Get other fields (handle both formats)
      const maxStayValue = rule.maxStay !== undefined ? rule.maxStay : rule.max_stay;
      const minStayArrivalValue = rule.minStayArrival !== undefined ? rule.minStayArrival : rule.min_stay_arrival;
      const minStayThroughValue = rule.minStayThrough !== undefined ? rule.minStayThrough : rule.min_stay_through;
      
      return {
        ...rule,
        // Normalize to camelCase
        id: typeof rule.id === 'string' ? parseInt(rule.id, 10) : rule.id,
        weekday: typeof rule.weekday === 'string' ? parseInt(rule.weekday, 10) : rule.weekday,
        maxStay: maxStayValue,
        minStayArrival: minStayArrivalValue,
        minStayThrough: minStayThroughValue,
        // Convert 1/0 to true/false
        closedToArrival: Boolean(
          closedToArrivalValue === 1 || 
          closedToArrivalValue === true || 
          closedToArrivalValue === '1' ||
          closedToArrivalValue === 'true'
        ),
        closedToDeparture: Boolean(
          closedToDepartureValue === 1 || 
          closedToDepartureValue === true || 
          closedToDepartureValue === '1' ||
          closedToDepartureValue === 'true'
        ),
        stopSell: Boolean(
          stopSellValue === 1 || 
          stopSellValue === true || 
          stopSellValue === '1' ||
          stopSellValue === 'true'
        ),
      };
    });
    
    console.log('🔄 Transformed daily rules:', response.data.daily_rules);
  }
  
  return response.data;
};

/**
 * Create rate plan
 * POST /api/rate-plans
 * 
 * ⚠️ CRITICAL: DO NOT send companyId in the payload!
 * The companyId is automatically extracted from your JWT token.
 */
export const createRatePlan = async (
  payload: CreateRatePlanPayload
): Promise<RatePlan> => {
  const response = await axiosClient.post<RatePlan>(BASE_URL, payload);
  return response.data;
};

/**
 * Update rate plan
 * PATCH /api/rate-plans/:id
 * 
 * ⚠️ CRITICAL: DO NOT send companyId, id, createdAt, or updatedAt in the payload!
 */
export const updateRatePlan = async (
  id: string,
  payload: UpdateRatePlanPayload
): Promise<RatePlan> => {
  const response = await axiosClient.patch<RatePlan>(`${BASE_URL}/${id}`, payload);
  return response.data;
};

/**
 * Delete rate plan
 * DELETE /api/rate-plans/:id
 * 
 * Note: This will cascade delete related Rate Plan Options and Rate Plan Rates.
 */
export const deleteRatePlan = async (id: string): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};

