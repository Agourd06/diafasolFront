/**
 * Rate Plan Daily Rules API Client
 * 
 * All endpoints require authentication (JWT token in Authorization header).
 * The companyId is automatically extracted from the token.
 */

import axiosClient from './axiosClient';
import type {
  RatePlanDailyRule,
  CreateRatePlanDailyRulePayload,
  UpdateRatePlanDailyRulePayload,
  PaginatedRatePlanDailyRulesResponse,
  RatePlanDailyRuleQueryParams,
} from '@/features/rate-plan-daily-rules/types';

const BASE_URL = '/rate-plan-daily-rules';

/**
 * Get all rate plan daily rules (paginated)
 * GET /api/rate-plan-daily-rules
 */
export const getRatePlanDailyRules = async (
  params?: RatePlanDailyRuleQueryParams
): Promise<PaginatedRatePlanDailyRulesResponse> => {
  try {
    console.log('🔍 Fetching rate plan daily rules with params:', params);
    const response = await axiosClient.get<any>(BASE_URL, { params });
    console.log('✅ Rate plan daily rules fetched successfully (raw):', response.data);
    
    // Transform the data: convert 1/0 to true/false for boolean fields
    const transformedData = {
      ...response.data,
      data: response.data.data?.map(transformDailyRule) || [],
    };
    console.log('✅ Rate plan daily rules transformed:', transformedData);
    
    return transformedData;
  } catch (error: any) {
    console.error('❌ Error fetching rate plan daily rules:', error);
    throw error;
  }
};

/**
 * Transform backend daily rule data to frontend format
 * Converts 1/0 to true/false for boolean fields
 */
const transformDailyRule = (rule: any): RatePlanDailyRule => {
  return {
    ...rule,
    id: typeof rule.id === 'string' ? parseInt(rule.id, 10) : rule.id,
    closedToArrival: Boolean(rule.closedToArrival === 1 || rule.closedToArrival === true || rule.closedToArrival === '1'),
    closedToDeparture: Boolean(rule.closedToDeparture === 1 || rule.closedToDeparture === true || rule.closedToDeparture === '1'),
    stopSell: Boolean(rule.stopSell === 1 || rule.stopSell === true || rule.stopSell === '1'),
    // Ensure weekday is a number
    weekday: typeof rule.weekday === 'string' ? parseInt(rule.weekday, 10) as 1 | 2 | 3 | 4 | 5 | 6 | 7 : rule.weekday,
  };
};

/**
 * Get daily rules by rate plan
 * GET /api/rate-plan-daily-rules/rate-plan/:ratePlanId
 */
export const getDailyRulesByRatePlan = async (ratePlanId: string): Promise<RatePlanDailyRule[]> => {
  try {
    console.log('🔍 Fetching daily rules for rate plan:', ratePlanId);
    const response = await axiosClient.get<any[]>(`${BASE_URL}/rate-plan/${ratePlanId}`);
    console.log('✅ Daily rules fetched successfully (raw):', response.data);
    
    // Transform the data: convert 1/0 to true/false for boolean fields
    const transformedData = response.data.map(transformDailyRule);
    console.log('✅ Daily rules transformed:', transformedData);
    
    return transformedData;
  } catch (error: any) {
    console.error('❌ Error fetching daily rules by rate plan:', error);
    console.error('Error details:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    });
    throw error;
  }
};

/**
 * Get rate plan daily rule by ID
 * GET /api/rate-plan-daily-rules/:id
 */
export const getRatePlanDailyRuleById = async (id: number): Promise<RatePlanDailyRule> => {
  const response = await axiosClient.get<any>(`${BASE_URL}/${id}`);
  // Transform the data: convert 1/0 to true/false for boolean fields
  return transformDailyRule(response.data);
};

/**
 * Create rate plan daily rule
 * POST /api/rate-plan-daily-rules
 * 
 * ⚠️ CRITICAL: DO NOT send companyId in the payload!
 * The companyId is automatically extracted from your JWT token.
 */
export const createRatePlanDailyRule = async (
  payload: CreateRatePlanDailyRulePayload
): Promise<RatePlanDailyRule> => {
  const response = await axiosClient.post<any>(BASE_URL, payload);
  // Transform the data: convert 1/0 to true/false for boolean fields
  return transformDailyRule(response.data);
};

/**
 * Update rate plan daily rule
 * PATCH /api/rate-plan-daily-rules/:id
 * 
 * ⚠️ CRITICAL: DO NOT send companyId or id in the payload!
 */
export const updateRatePlanDailyRule = async (
  id: number,
  payload: UpdateRatePlanDailyRulePayload
): Promise<RatePlanDailyRule> => {
  const response = await axiosClient.patch<any>(`${BASE_URL}/${id}`, payload);
  // Transform the data: convert 1/0 to true/false for boolean fields
  return transformDailyRule(response.data);
};

/**
 * Delete rate plan daily rule
 * DELETE /api/rate-plan-daily-rules/:id
 */
export const deleteRatePlanDailyRule = async (id: number): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};

