/**
 * Rate Plan Period Rules API Client
 * 
 * All endpoints require authentication (JWT token in Authorization header).
 * The companyId is automatically extracted from the token.
 */

import axiosClient from './axiosClient';
import type {
  RatePlanPeriodRule,
  CreateRatePlanPeriodRulePayload,
  UpdateRatePlanPeriodRulePayload,
  PaginatedRatePlanPeriodRulesResponse,
  RatePlanPeriodRuleQueryParams,
} from '@/features/rate-plan-period-rules/types';

const BASE_URL = '/rate-plan-period-rules';

/**
 * Get all rate plan period rules (paginated)
 * GET /api/rate-plan-period-rules
 */
export const getRatePlanPeriodRules = async (
  params?: RatePlanPeriodRuleQueryParams
): Promise<PaginatedRatePlanPeriodRulesResponse> => {
  try {
    console.log('🔍 Fetching rate plan period rules with params:', params);
    const response = await axiosClient.get<PaginatedRatePlanPeriodRulesResponse>(
      BASE_URL,
      { params }
    );
    console.log('✅ Rate plan period rules fetched successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching rate plan period rules:', error);
    throw error;
  }
};

/**
 * Get period rules by rate plan
 * GET /api/rate-plan-period-rules/rate-plan/:ratePlanId
 */
export const getPeriodRulesByRatePlan = async (ratePlanId: string): Promise<RatePlanPeriodRule[]> => {
  const response = await axiosClient.get<RatePlanPeriodRule[]>(`${BASE_URL}/rate-plan/${ratePlanId}`);
  return response.data;
};

/**
 * Get rate plan period rule by ID
 * GET /api/rate-plan-period-rules/:id
 */
export const getRatePlanPeriodRuleById = async (id: number): Promise<RatePlanPeriodRule> => {
  const response = await axiosClient.get<RatePlanPeriodRule>(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * Create rate plan period rule
 * POST /api/rate-plan-period-rules
 * 
 * ⚠️ CRITICAL: DO NOT send companyId in the payload!
 * The companyId is automatically extracted from your JWT token.
 */
export const createRatePlanPeriodRule = async (
  payload: CreateRatePlanPeriodRulePayload
): Promise<RatePlanPeriodRule> => {
  const response = await axiosClient.post<RatePlanPeriodRule>(BASE_URL, payload);
  return response.data;
};

/**
 * Update rate plan period rule
 * PATCH /api/rate-plan-period-rules/:id
 * 
 * ⚠️ CRITICAL: DO NOT send companyId or id in the payload!
 */
export const updateRatePlanPeriodRule = async (
  id: number,
  payload: UpdateRatePlanPeriodRulePayload
): Promise<RatePlanPeriodRule> => {
  const response = await axiosClient.patch<RatePlanPeriodRule>(`${BASE_URL}/${id}`, payload);
  return response.data;
};

/**
 * Delete rate plan period rule
 * DELETE /api/rate-plan-period-rules/:id
 */
export const deleteRatePlanPeriodRule = async (id: number): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};

