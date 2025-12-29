import axiosClient from './axiosClient';
import type { 
  TaxApplicableDateRange, 
  CreateTaxApplicableDateRangePayload, 
  UpdateTaxApplicableDateRangePayload, 
  PaginatedTaxApplicableDateRangesResponse,
  TaxApplicableDateRangeQueryParams 
} from '@/features/tax-applicable-date-ranges/types';

/**
 * Get paginated list of tax applicable date ranges
 */
export const getTaxApplicableDateRanges = async (
  params?: TaxApplicableDateRangeQueryParams
): Promise<PaginatedTaxApplicableDateRangesResponse> => {
  const response = await axiosClient.get('/tax-applicable-date-ranges', { params });
  return response.data;
};

/**
 * Search tax applicable date ranges by query string
 */
export const searchTaxApplicableDateRanges = async (query: string): Promise<TaxApplicableDateRange[]> => {
  const response = await axiosClient.get(`/tax-applicable-date-ranges/search`, {
    params: { q: query }
  });
  return response.data;
};

/**
 * Get date ranges by tax ID
 */
export const getDateRangesByTax = async (taxId: string): Promise<TaxApplicableDateRange[]> => {
  const response = await axiosClient.get(`/tax-applicable-date-ranges/tax/${taxId}`);
  return response.data;
};

/**
 * Get a single tax applicable date range by ID
 */
export const getTaxApplicableDateRangeById = async (id: number): Promise<TaxApplicableDateRange> => {
  const response = await axiosClient.get(`/tax-applicable-date-ranges/${id}`);
  return response.data;
};

/**
 * Create a new tax applicable date range
 */
export const createTaxApplicableDateRange = async (
  payload: CreateTaxApplicableDateRangePayload
): Promise<TaxApplicableDateRange> => {
  const response = await axiosClient.post('/tax-applicable-date-ranges', payload);
  return response.data;
};

/**
 * Update an existing tax applicable date range
 */
export const updateTaxApplicableDateRange = async (
  id: number,
  payload: UpdateTaxApplicableDateRangePayload
): Promise<TaxApplicableDateRange> => {
  const response = await axiosClient.patch(`/tax-applicable-date-ranges/${id}`, payload);
  return response.data;
};

/**
 * Delete a tax applicable date range
 */
export const deleteTaxApplicableDateRange = async (id: number): Promise<void> => {
  await axiosClient.delete(`/tax-applicable-date-ranges/${id}`);
};

