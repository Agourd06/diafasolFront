/**
 * Tax Sets API Client
 * 
 * All endpoints require authentication (JWT token in Authorization header).
 * The companyId is automatically extracted from the token.
 */

import axiosClient from './axiosClient';
import type {
  TaxSet,
  CreateTaxSetPayload,
  UpdateTaxSetPayload,
  PaginatedTaxSetsResponse,
  TaxSetQueryParams,
} from '@/features/tax-sets/types';

const BASE_URL = '/tax-sets';

/**
 * Get all tax sets (paginated)
 * GET /api/tax-sets
 */
export const getTaxSets = async (
  params?: TaxSetQueryParams
): Promise<PaginatedTaxSetsResponse> => {
  try {
    console.log('🔍 Fetching tax sets with params:', params);
    const response = await axiosClient.get<PaginatedTaxSetsResponse>(
      BASE_URL,
      { params }
    );
    console.log('✅ Tax sets fetched successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching tax sets:', error);
    throw error;
  }
};

/**
 * Search tax sets
 * GET /api/tax-sets/search?q=term
 */
export const searchTaxSets = async (searchTerm: string): Promise<TaxSet[]> => {
  const response = await axiosClient.get<TaxSet[]>(`${BASE_URL}/search`, {
    params: { q: searchTerm },
  });
  return response.data;
};

/**
 * Get tax sets by property
 * GET /api/tax-sets/property/:propertyId
 */
export const getTaxSetsByProperty = async (propertyId: string): Promise<TaxSet[]> => {
  const response = await axiosClient.get<TaxSet[]>(`${BASE_URL}/property/${propertyId}`);
  return response.data;
};

/**
 * Get tax set by ID
 * GET /api/tax-sets/:id
 */
export const getTaxSetById = async (id: string): Promise<TaxSet> => {
  const response = await axiosClient.get<TaxSet>(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * Create tax set
 * POST /api/tax-sets
 * 
 * ⚠️ CRITICAL: DO NOT send companyId in the payload!
 * The companyId is automatically extracted from your JWT token.
 */
export const createTaxSet = async (
  payload: CreateTaxSetPayload
): Promise<TaxSet> => {
  const response = await axiosClient.post<TaxSet>(BASE_URL, payload);
  return response.data;
};

/**
 * Update tax set
 * PATCH /api/tax-sets/:id
 * 
 * ⚠️ CRITICAL: DO NOT send companyId, id, createdAt, or updatedAt in the payload!
 */
export const updateTaxSet = async (
  id: string,
  payload: UpdateTaxSetPayload
): Promise<TaxSet> => {
  const response = await axiosClient.patch<TaxSet>(`${BASE_URL}/${id}`, payload);
  return response.data;
};

/**
 * Delete tax set
 * DELETE /api/tax-sets/:id
 */
export const deleteTaxSet = async (id: string): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};
