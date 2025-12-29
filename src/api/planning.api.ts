/**
 * Planning API Client
 * 
 * Handles API calls for the planning/inventory grid view.
 */

import axiosClient from './axiosClient';
import type { PlanningResponse, PlanningFilters } from '@/features/planning/types';

const BASE_URL = '/planning';

/**
 * Get planning data for a property and date range
 * GET /api/planning/property/:propertyId
 * 
 * Query Parameters:
 * - startDate (string, required) - Start date (YYYY-MM-DD)
 * - endDate (string, required) - End date (YYYY-MM-DD)
 * - roomTypeIds (string[], optional) - Filter by room type IDs
 * - ratePlanIds (string[], optional) - Filter by rate plan IDs
 */
export const getPlanningData = async (
  propertyId: string,
  startDate: string,
  endDate: string,
  filters?: PlanningFilters
): Promise<PlanningResponse> => {
  try {
    const params: any = {
      startDate,
      endDate,
    };
    
    if (filters?.roomTypeIds && filters.roomTypeIds.length > 0) {
      params.roomTypeIds = filters.roomTypeIds.join(',');
    }
    
    if (filters?.ratePlanIds && filters.ratePlanIds.length > 0) {
      params.ratePlanIds = filters.ratePlanIds.join(',');
    }
    
    const response = await axiosClient.get<PlanningResponse>(
      `${BASE_URL}/property/${propertyId}`,
      { params }
    );
    
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Batch update availability records
 * PATCH /api/planning/availability/batch
 * 
 * Body: {
 *   updates: [
 *     { id: number, availability: number },
 *     { id: number, availability: number },
 *     ...
 *   ]
 * }
 */
export interface BatchAvailabilityUpdate {
  id: number;
  availability: number;
}

export interface BatchAvailabilityUpdatePayload {
  updates: BatchAvailabilityUpdate[];
}

export const batchUpdateAvailability = async (
  payload: BatchAvailabilityUpdatePayload
): Promise<void> => {
  try {
    console.log('📤 Batch updating availability:', payload.updates.length, 'records');
    await axiosClient.patch(`${BASE_URL}/availability/batch`, payload);
    console.log('✅ Availability batch updated successfully');
  } catch (error: any) {
    console.error('❌ Error batch updating availability:', error);
    throw error;
  }
};

/**
 * Batch update rate plan rates
 * PATCH /api/planning/rates/batch
 * 
 * Body: {
 *   updates: [
 *     { id: number, rate: number },
 *     { id: number, rate: number },
 *     ...
 *   ]
 * }
 */
export interface BatchRateUpdate {
  id: number;
  rate: number;
}

export interface BatchRateUpdatePayload {
  updates: BatchRateUpdate[];
}

export const batchUpdateRates = async (
  payload: BatchRateUpdatePayload
): Promise<void> => {
  try {
    await axiosClient.patch(`${BASE_URL}/rates/batch`, payload);
  } catch (error: any) {
    throw error;
  }
};

