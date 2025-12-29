/**
 * Event Review Scores API Client
 * 
 * Handles API calls for event-review-scores CRUD operations.
 * All endpoints require JWT authentication.
 * The companyId is automatically extracted from the token.
 */

import axiosClient from './axiosClient';
import type {
  EventReviewScore,
  CreateEventReviewScorePayload,
} from '@/features/event-messages/types';

const BASE_URL = '/event-review-scores';

/**
 * Create a review score
 * POST /api/event-review-scores
 * 
 * ⚠️ WARNING: Do NOT include companyId in the payload!
 * The companyId is automatically extracted from the JWT token.
 */
export const createEventReviewScore = async (
  payload: CreateEventReviewScorePayload
): Promise<EventReviewScore> => {
  try {
    console.log('📤 Creating review score:', {
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
    
    const response = await axiosClient.post<EventReviewScore>(BASE_URL, cleanPayload);
    console.log('✅ Review score created successfully:', response.data.id);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating review score:', error);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Get a review score by ID
 * GET /api/event-review-scores/:id
 */
export const getEventReviewScoreById = async (id: string): Promise<EventReviewScore> => {
  try {
    const response = await axiosClient.get<EventReviewScore>(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching review score:', error);
    throw error;
  }
};

