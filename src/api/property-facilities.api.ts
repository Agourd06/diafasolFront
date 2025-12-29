/**
 * Property Facilities API Client
 * 
 * All endpoints require authentication (JWT token in Authorization header).
 * The companyId is automatically extracted from the token.
 */

import axiosClient from './axiosClient';
import type {
  PropertyFacilityLink,
  CreatePropertyFacilityLinkPayload,
  PaginatedPropertyFacilitiesResponse,
  PropertyFacilitiesQueryParams,
} from '@/features/property-facilities/types';

const BASE_URL = '/properties-facilities';

/**
 * Get all property-facility links (paginated)
 * GET /api/properties-facilities
 */
export const getPropertyFacilities = async (
  params?: PropertyFacilitiesQueryParams
): Promise<PaginatedPropertyFacilitiesResponse> => {
  const response = await axiosClient.get<PaginatedPropertyFacilitiesResponse>(
    BASE_URL,
    { params }
  );
  return response.data;
};

/**
 * Get property-facility links by property ID
 * GET /api/properties-facilities/property/:propertyId
 */
export const getPropertyFacilitiesByPropertyId = async (
  propertyId: string
): Promise<PropertyFacilityLink[]> => {
  const response = await axiosClient.get<PropertyFacilityLink[]>(
    `${BASE_URL}/property/${propertyId}`
  );
  return response.data;
};

/**
 * Add facility to property
 * POST /api/properties-facilities
 * 
 * ⚠️ CRITICAL: DO NOT send companyId in the payload!
 * The companyId is automatically extracted from your JWT token.
 */
export const createPropertyFacilityLink = async (
  payload: CreatePropertyFacilityLinkPayload
): Promise<PropertyFacilityLink> => {
  const response = await axiosClient.post<PropertyFacilityLink>(BASE_URL, payload);
  return response.data;
};

/**
 * Remove facility from property
 * DELETE /api/properties-facilities/:propertyId/:facilityId
 */
export const deletePropertyFacilityLink = async (
  propertyId: string,
  facilityId: string
): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${propertyId}/${facilityId}`);
};

