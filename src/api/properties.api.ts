/**
 * Properties API Client
 * 
 * All endpoints require authentication (JWT token in Authorization header).
 * The companyId is automatically extracted from the token.
 */

import axiosClient from './axiosClient';
import type {
  Property,
  CreatePropertyPayload,
  UpdatePropertyPayload,
  PaginatedPropertiesResponse,
  PropertyQueryParams,
  PropertyLocationFilter,
} from '@/features/properties/types';
import type { CreateChannexPropertyPayload } from './channex.api';

const BASE_URL = '/properties';

/**
 * Get all properties (paginated)
 * GET /api/properties
 */
export const getProperties = async (
  params?: PropertyQueryParams
): Promise<PaginatedPropertiesResponse> => {
  try {
    // Transform camelCase groupId to snake_case group_id for backend compatibility
    // Backend expects group_id (snake_case) as query parameter to match database column
    // See: Groups Frontend Implementation Guide - "Filtering Properties by Group" section
    const apiParams: any = params ? { ...params } : {};
    
    // If groupId is provided, send it as group_id (snake_case) which matches database column
    if (apiParams.groupId) {
      apiParams.group_id = apiParams.groupId;
      delete apiParams.groupId;
    }
    
    const response = await axiosClient.get<PaginatedPropertiesResponse>(
      BASE_URL,
      { params: apiParams }
    );
    return response.data;
  } catch (error: any) {
    // Re-throw with more context if available
    if (error.response?.data) {
      const backendError = new Error(
        error.response.data.message || 
        error.response.data.error || 
        `Backend error: ${error.response.status} ${error.response.statusText}`
      );
      (backendError as any).response = error.response;
      (backendError as any).config = error.config;
      throw backendError;
    }
    
    throw error;
  }
};

/**
 * Search properties
 * GET /api/properties/search?q=term
 */
export const searchProperties = async (searchTerm: string): Promise<Property[]> => {
  const response = await axiosClient.get<Property[]>(`${BASE_URL}/search`, {
    params: { q: searchTerm },
  });
  return response.data;
};

/**
 * Filter properties by location
 * GET /api/properties/filter?country=US&state=California&city=Los Angeles
 */
export const filterPropertiesByLocation = async (
  filters: PropertyLocationFilter
): Promise<Property[]> => {
  const response = await axiosClient.get<Property[]>(`${BASE_URL}/filter`, {
    params: filters,
  });
  return response.data;
};

/**
 * Get property by ID
 * GET /api/properties/:id
 */
export const getPropertyById = async (id: string): Promise<Property> => {
  const response = await axiosClient.get<Property>(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * Get property data formatted for Channex CREATE sync
 * GET /api/properties/:id/channex-sync
 * Returns property with all related settings, content, and photos in Channex format (includes settings, group_id, logo_url, website, important_information)
 */
export const getPropertyForChannexSync = async (id: string): Promise<{ property: CreateChannexPropertyPayload }> => {
  const response = await axiosClient.get<{ property: CreateChannexPropertyPayload }>(`${BASE_URL}/${id}/channex-sync`);
  return response.data;
};

/**
 * Get property data formatted for Channex UPDATE sync
 * GET /api/properties/:id/channex-sync-update
 * Returns property with content and photos in Channex format (excludes settings, group_id, logo_url, website, important_information)
 */
export const getPropertyForChannexUpdateSync = async (id: string): Promise<{ property: Partial<CreateChannexPropertyPayload> }> => {
  const response = await axiosClient.get<{ property: Partial<CreateChannexPropertyPayload> }>(`${BASE_URL}/${id}/channex-sync-update`);
  return response.data;
};

/**
 * Create property
 * POST /api/properties
 * 
 * ⚠️ CRITICAL: DO NOT send companyId in the payload!
 * The companyId is automatically extracted from your JWT token.
 * Sending it will result in: "property companyId should not exist"
 */
export const createProperty = async (
  payload: CreatePropertyPayload
): Promise<Property> => {
  const response = await axiosClient.post<Property>(BASE_URL, payload);
  return response.data;
};

/**
 * Update property
 * PATCH /api/properties/:id
 * 
 * ⚠️ CRITICAL: DO NOT send companyId, id, createdAt, or updatedAt in the payload!
 */
export const updateProperty = async (
  id: string,
  payload: UpdatePropertyPayload
): Promise<Property> => {
  const response = await axiosClient.patch<Property>(`${BASE_URL}/${id}`, payload);
  return response.data;
};

/**
 * Delete property
 * DELETE /api/properties/:id
 */
export const deleteProperty = async (id: string): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};

