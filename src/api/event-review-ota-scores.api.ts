/**
 * Event Review OTA Scores API Client
 * 
 * Handles API calls for event-review-ota-scores CRUD operations.
 * All endpoints require JWT authentication.
 * The companyId is automatically extracted from the token.
 */

import axiosClient from './axiosClient';
import type {
  EventReviewOtaScore,
  CreateEventReviewOtaScorePayload,
} from '@/features/event-messages/types';

const BASE_URL = '/event-review-ota-scores';

/**
 * Create a review OTA score
 * POST /api/event-review-ota-scores
 * 
 * ⚠️ WARNING: Do NOT include companyId in the payload!
 * The companyId is automatically extracted from the JWT token.
 */
export const createEventReviewOtaScore = async (
  payload: CreateEventReviewOtaScorePayload
): Promise<EventReviewOtaScore> => {
  try {
    console.log('📤 Creating review OTA score:', {
      eventDetailsId: payload.eventDetailsId,
      category: payload.category,
      score: payload.score,
    });
    
    // Ensure companyId is NOT in the payload
    const cleanPayload = { ...payload };
    if ('companyId' in cleanPayload) {
      console.warn('⚠️ Removing companyId from payload - it is auto-set from JWT token');
      delete (cleanPayload as any).companyId;
    }
    
    const response = await axiosClient.post<EventReviewOtaScore>(BASE_URL, cleanPayload);
    console.log('✅ Review OTA score created successfully:', response.data.id);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating review OTA score:', error);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Get a review OTA score by ID
 * GET /api/event-review-ota-scores/:id
 */
export const getEventReviewOtaScoreById = async (id: string): Promise<EventReviewOtaScore> => {
  try {
    const response = await axiosClient.get<EventReviewOtaScore>(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching review OTA score:', error);
    throw error;
  }
};

