/**
 * Rate Plan Options API Client
 * 
 * All endpoints require authentication (JWT token in Authorization header).
 * The companyId is automatically extracted from the token.
 */

import axiosClient from './axiosClient';
import type {
  RatePlanOption,
  CreateRatePlanOptionPayload,
  UpdateRatePlanOptionPayload,
  PaginatedRatePlanOptionsResponse,
  RatePlanOptionQueryParams,
} from '@/features/rate-plan-options/types';

const BASE_URL = '/rate-plan-options';

/**
 * Get all rate plan options (paginated)
 * GET /api/rate-plan-options
 */
export const getRatePlanOptions = async (
  params?: RatePlanOptionQueryParams
): Promise<PaginatedRatePlanOptionsResponse> => {
  try {
    console.log('🔍 Fetching rate plan options with params:', params);
    const response = await axiosClient.get<PaginatedRatePlanOptionsResponse>(
      BASE_URL,
      { params }
    );
    console.log('✅ Rate plan options fetched successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching rate plan options:', error);
    throw error;
  }
};

/**
 * Search rate plan options
 * GET /api/rate-plan-options/search?q=term
 */
export const searchRatePlanOptions = async (searchTerm: string): Promise<RatePlanOption[]> => {
  const response = await axiosClient.get<RatePlanOption[]>(`${BASE_URL}/search`, {
    params: { q: searchTerm },
  });
  return response.data;
};

/**
 * Get options by rate plan
 * GET /api/rate-plan-options/rate-plan/:ratePlanId
 */
export const getOptionsByRatePlan = async (ratePlanId: string): Promise<RatePlanOption[]> => {
  const response = await axiosClient.get<RatePlanOption[]>(`${BASE_URL}/rate-plan/${ratePlanId}`);
  return response.data;
};

/**
 * Get rate plan option by ID
 * GET /api/rate-plan-options/:id
 */
export const getRatePlanOptionById = async (id: number): Promise<RatePlanOption> => {
  const response = await axiosClient.get<RatePlanOption>(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * Create rate plan option
 * POST /api/rate-plan-options
 * 
 * ⚠️ CRITICAL: DO NOT send companyId in the payload!
 * The companyId is automatically extracted from your JWT token.
 */
export const createRatePlanOption = async (
  payload: CreateRatePlanOptionPayload
): Promise<RatePlanOption> => {
  const response = await axiosClient.post<RatePlanOption>(BASE_URL, payload);
  return response.data;
};

/**
 * Update rate plan option
 * PATCH /api/rate-plan-options/:id
 * 
 * ⚠️ CRITICAL: DO NOT send companyId or id in the payload!
 */
export const updateRatePlanOption = async (
  id: number,
  payload: UpdateRatePlanOptionPayload
): Promise<RatePlanOption> => {
  const response = await axiosClient.patch<RatePlanOption>(`${BASE_URL}/${id}`, payload);
  return response.data;
};

/**
 * Delete rate plan option
 * DELETE /api/rate-plan-options/:id
 */
export const deleteRatePlanOption = async (id: number): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};

