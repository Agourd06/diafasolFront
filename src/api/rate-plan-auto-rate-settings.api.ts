/**
 * Rate Plan Auto Rate Settings API Client
 * 
 * All endpoints require authentication (JWT token in Authorization header).
 * The companyId is automatically extracted from the token.
 */

import axiosClient from './axiosClient';
import type {
  RatePlanAutoRateSetting,
  CreateRatePlanAutoRateSettingPayload,
  UpdateRatePlanAutoRateSettingPayload,
  PaginatedRatePlanAutoRateSettingsResponse,
  RatePlanAutoRateSettingQueryParams,
} from '@/features/rate-plan-auto-rate-settings/types';

const BASE_URL = '/rate-plan-auto-rate-settings';

/**
 * Get all rate plan auto rate settings (paginated)
 * GET /api/rate-plan-auto-rate-settings
 */
export const getRatePlanAutoRateSettings = async (
  params?: RatePlanAutoRateSettingQueryParams
): Promise<PaginatedRatePlanAutoRateSettingsResponse> => {
  try {
    console.log('🔍 Fetching rate plan auto rate settings with params:', params);
    const response = await axiosClient.get<PaginatedRatePlanAutoRateSettingsResponse>(
      BASE_URL,
      { params }
    );
    console.log('✅ Rate plan auto rate settings fetched successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching rate plan auto rate settings:', error);
    throw error;
  }
};

/**
 * Get auto rate settings by rate plan
 * GET /api/rate-plan-auto-rate-settings/rate-plan/:ratePlanId
 */
export const getAutoRateSettingsByRatePlan = async (ratePlanId: string): Promise<RatePlanAutoRateSetting[]> => {
  const response = await axiosClient.get<RatePlanAutoRateSetting[]>(`${BASE_URL}/rate-plan/${ratePlanId}`);
  return response.data;
};

/**
 * Get rate plan auto rate setting by ID
 * GET /api/rate-plan-auto-rate-settings/:id
 */
export const getRatePlanAutoRateSettingById = async (id: number): Promise<RatePlanAutoRateSetting> => {
  const response = await axiosClient.get<RatePlanAutoRateSetting>(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * Create rate plan auto rate setting
 * POST /api/rate-plan-auto-rate-settings
 * 
 * ⚠️ CRITICAL: DO NOT send companyId in the payload!
 * The companyId is automatically extracted from your JWT token.
 */
export const createRatePlanAutoRateSetting = async (
  payload: CreateRatePlanAutoRateSettingPayload
): Promise<RatePlanAutoRateSetting> => {
  const response = await axiosClient.post<RatePlanAutoRateSetting>(BASE_URL, payload);
  return response.data;
};

/**
 * Update rate plan auto rate setting
 * PATCH /api/rate-plan-auto-rate-settings/:id
 * 
 * ⚠️ CRITICAL: DO NOT send companyId or id in the payload!
 */
export const updateRatePlanAutoRateSetting = async (
  id: number,
  payload: UpdateRatePlanAutoRateSettingPayload
): Promise<RatePlanAutoRateSetting> => {
  const response = await axiosClient.patch<RatePlanAutoRateSetting>(`${BASE_URL}/${id}`, payload);
  return response.data;
};

/**
 * Delete rate plan auto rate setting
 * DELETE /api/rate-plan-auto-rate-settings/:id
 */
export const deleteRatePlanAutoRateSetting = async (id: number): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};

