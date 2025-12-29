/**
 * Property Content API Client
 * 
 * All endpoints require authentication (JWT token in Authorization header).
 * The companyId is automatically extracted from the token.
 */

import axiosClient from './axiosClient';
import type {
  PropertyContent,
  CreatePropertyContentPayload,
  UpdatePropertyContentPayload,
  PaginatedPropertyContentResponse,
  PropertyContentQueryParams,
} from '@/features/property-content/types';

const BASE_URL = '/properties-content';

/**
 * Get all property content records (paginated)
 * GET /api/properties-content
 */
export const getPropertyContents = async (
  params?: PropertyContentQueryParams
): Promise<PaginatedPropertyContentResponse> => {
  const response = await axiosClient.get<PaginatedPropertyContentResponse>(
    BASE_URL,
    { params }
  );
  return response.data;
};

/**
 * Search property content
 * GET /api/properties-content/search?q=term
 */
export const searchPropertyContent = async (searchTerm: string): Promise<PropertyContent[]> => {
  const response = await axiosClient.get<PropertyContent[]>(`${BASE_URL}/search`, {
    params: { q: searchTerm },
  });
  return response.data;
};

/**
 * Get property content by property ID
 * GET /api/properties-content/:propertyId
 */
export const getPropertyContentByPropertyId = async (propertyId: string): Promise<PropertyContent> => {
  const response = await axiosClient.get<PropertyContent>(`${BASE_URL}/${propertyId}`);
  return response.data;
};

/**
 * Create property content
 * POST /api/properties-content
 * 
 * ⚠️ CRITICAL: DO NOT send companyId in the payload!
 * The companyId is automatically extracted from your JWT token.
 */
export const createPropertyContent = async (
  payload: CreatePropertyContentPayload
): Promise<PropertyContent> => {
  const response = await axiosClient.post<PropertyContent>(BASE_URL, payload);
  return response.data;
};

/**
 * Update property content
 * PATCH /api/properties-content/:propertyId
 * 
 * ⚠️ CRITICAL: DO NOT send propertyId, companyId, createdAt, or updatedAt in the payload!
 */
export const updatePropertyContent = async (
  propertyId: string,
  payload: UpdatePropertyContentPayload
): Promise<PropertyContent> => {
  const response = await axiosClient.patch<PropertyContent>(
    `${BASE_URL}/${propertyId}`,
    payload
  );
  return response.data;
};

/**
 * Delete property content
 * DELETE /api/properties-content/:propertyId
 */
export const deletePropertyContent = async (propertyId: string): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${propertyId}`);
};

