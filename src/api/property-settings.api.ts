/**
 * Property Settings API Client
 * 
 * All endpoints require authentication (JWT token in Authorization header).
 * The companyId is automatically extracted from the token.
 */

import axiosClient from './axiosClient';
import type {
  PropertySettings,
  CreatePropertySettingsPayload,
  UpdatePropertySettingsPayload,
  PaginatedPropertySettingsResponse,
  PropertySettingsQueryParams,
} from '@/features/property-settings/types';

const BASE_URL = '/properties-settings';

/**
 * Get all property settings (paginated)
 * GET /api/properties-settings
 */
export const getPropertySettings = async (
  params?: PropertySettingsQueryParams
): Promise<PaginatedPropertySettingsResponse> => {
  const response = await axiosClient.get<PaginatedPropertySettingsResponse>(
    BASE_URL,
    { params }
  );
  return response.data;
};

/**
 * Get property settings by property ID
 * GET /api/properties-settings/:propertyId
 */
export const getPropertySettingsByPropertyId = async (
  propertyId: string
): Promise<PropertySettings> => {
  const response = await axiosClient.get<PropertySettings>(`${BASE_URL}/${propertyId}`);
  return response.data;
};

/**
 * Create property settings
 * POST /api/properties-settings
 * 
 * ⚠️ CRITICAL: DO NOT send companyId in the payload!
 * The companyId is automatically extracted from your JWT token.
 */
export const createPropertySettings = async (
  payload: CreatePropertySettingsPayload
): Promise<PropertySettings> => {
  const response = await axiosClient.post<PropertySettings>(BASE_URL, payload);
  return response.data;
};

/**
 * Update property settings
 * PATCH /api/properties-settings/:propertyId
 * 
 * ⚠️ CRITICAL: DO NOT send propertyId, companyId, createdAt, or updatedAt in the payload!
 */
export const updatePropertySettings = async (
  propertyId: string,
  payload: UpdatePropertySettingsPayload
): Promise<PropertySettings> => {
  const response = await axiosClient.patch<PropertySettings>(
    `${BASE_URL}/${propertyId}`,
    payload
  );
  return response.data;
};

/**
 * Delete property settings
 * DELETE /api/properties-settings/:propertyId
 */
export const deletePropertySettings = async (propertyId: string): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${propertyId}`);
};

