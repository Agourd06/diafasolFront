/**
 * Property Photos API Client
 * 
 * All endpoints require authentication (JWT token in Authorization header).
 * The companyId is automatically extracted from the token.
 */

import axiosClient from './axiosClient';
import type {
  PropertyPhoto,
  CreatePropertyPhotoPayload,
  UpdatePropertyPhotoPayload,
  PaginatedPropertyPhotosResponse,
  PropertyPhotosQueryParams,
} from '@/features/property-photos/types';

const BASE_URL = '/properties-photos';

/**
 * Get all property photos (paginated)
 * GET /api/properties-photos
 */
export const getPropertyPhotos = async (
  params?: PropertyPhotosQueryParams
): Promise<PaginatedPropertyPhotosResponse> => {
  const response = await axiosClient.get<PaginatedPropertyPhotosResponse>(
    BASE_URL,
    { params }
  );
  return response.data;
};

/**
 * Search property photos
 * GET /api/properties-photos/search?q=term
 */
export const searchPropertyPhotos = async (searchTerm: string): Promise<PropertyPhoto[]> => {
  const response = await axiosClient.get<PropertyPhoto[]>(`${BASE_URL}/search`, {
    params: { q: searchTerm },
  });
  return response.data;
};

/**
 * Get property photos by property ID
 * GET /api/properties-photos/property/:propertyId
 */
export const getPropertyPhotosByPropertyId = async (
  propertyId: string
): Promise<PropertyPhoto[]> => {
  const response = await axiosClient.get<PropertyPhoto[]>(`${BASE_URL}/property/${propertyId}`);
  return response.data;
};

/**
 * Get property photo by ID
 * GET /api/properties-photos/:id
 */
export const getPropertyPhotoById = async (id: number): Promise<PropertyPhoto> => {
  const response = await axiosClient.get<PropertyPhoto>(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * Create property photo
 * POST /api/properties-photos
 * 
 * ⚠️ CRITICAL: DO NOT send companyId in the payload!
 * The companyId is automatically extracted from your JWT token.
 */
export const createPropertyPhoto = async (
  payload: CreatePropertyPhotoPayload
): Promise<PropertyPhoto> => {
  const response = await axiosClient.post<PropertyPhoto>(BASE_URL, payload);
  return response.data;
};

/**
 * Update property photo
 * PATCH /api/properties-photos/:id
 * 
 * ⚠️ CRITICAL: DO NOT send id, propertyId, companyId, createdAt, or updatedAt in the payload!
 */
export const updatePropertyPhoto = async (
  id: number,
  payload: UpdatePropertyPhotoPayload
): Promise<PropertyPhoto> => {
  const response = await axiosClient.patch<PropertyPhoto>(`${BASE_URL}/${id}`, payload);
  return response.data;
};

/**
 * Delete property photo
 * DELETE /api/properties-photos/:id
 */
export const deletePropertyPhoto = async (id: number): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};

