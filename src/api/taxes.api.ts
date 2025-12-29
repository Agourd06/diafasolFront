import axiosClient from './axiosClient';
import type { 
  Tax, 
  CreateTaxPayload, 
  UpdateTaxPayload, 
  PaginatedTaxesResponse,
  TaxQueryParams 
} from '@/features/taxes/types';

/**
 * Get paginated list of taxes
 */
export const getTaxes = async (params?: TaxQueryParams): Promise<PaginatedTaxesResponse> => {
  const response = await axiosClient.get('/taxes', { params });
  return response.data;
};

/**
 * Search taxes by query string
 */
export const searchTaxes = async (query: string): Promise<Tax[]> => {
  const response = await axiosClient.get(`/taxes/search`, {
    params: { q: query }
  });
  return response.data;
};

/**
 * Get taxes by property ID
 */
export const getTaxesByProperty = async (propertyId: string): Promise<Tax[]> => {
  const response = await axiosClient.get(`/taxes/property/${propertyId}`);
  return response.data;
};

/**
 * Get a single tax by ID
 */
export const getTaxById = async (id: string): Promise<Tax> => {
  const response = await axiosClient.get(`/taxes/${id}`);
  return response.data;
};

/**
 * Create a new tax
 */
export const createTax = async (payload: CreateTaxPayload): Promise<Tax> => {
  const response = await axiosClient.post('/taxes', payload);
  return response.data;
};

/**
 * Update an existing tax
 */
export const updateTax = async (id: string, payload: UpdateTaxPayload): Promise<Tax> => {
  const response = await axiosClient.patch(`/taxes/${id}`, payload);
  return response.data;
};

/**
 * Delete a tax
 * Note: This will cascade delete related Tax Applicable Date Ranges
 */
export const deleteTax = async (id: string): Promise<void> => {
  await axiosClient.delete(`/taxes/${id}`);
};

