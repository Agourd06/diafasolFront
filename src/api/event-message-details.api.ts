/**
 * Event Details API Client
 * 
 * Handles API calls for event_details CRUD operations.
 * All endpoints require JWT authentication.
 * The companyId is automatically extracted from the token.
 */

import axiosClient from './axiosClient';
import type {
  EventMessageDetails,
  CreateEventMessageDetailsPayload,
} from '@/features/event-messages/types';

const BASE_URL = '/event-details';

/**
 * Create event details
 * POST /api/event-details
 * 
 * ⚠️ WARNING: Do NOT include companyId in the payload!
 * The companyId is automatically extracted from the JWT token.
 */
export const createEventMessageDetails = async (
  payload: CreateEventMessageDetailsPayload
): Promise<EventMessageDetails> => {
  try {
    console.log('📤 Creating event message details:', {
      eventMessageId: payload.eventMessageId,
      hasMessage: !!payload.message,
      hasSender: !!payload.sender,
      hasMeta: !!payload.meta,
      messagePreview: payload.message?.substring(0, 50) || 'N/A',
    });
    
    // Ensure companyId is NOT in the payload
    const cleanPayload = { ...payload };
    if ('companyId' in cleanPayload) {
      console.warn('⚠️ Removing companyId from payload - it is auto-set from JWT token');
      delete (cleanPayload as any).companyId;
    }
    
    const response = await axiosClient.post<EventMessageDetails>(BASE_URL, cleanPayload);
    console.log('✅ Event message details created successfully:', response.data.id);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating event message details:', error);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Get event details by ID
 * GET /api/event-details/:id
 */
export const getEventMessageDetailsById = async (
  id: string
): Promise<EventMessageDetails> => {
  try {
    const response = await axiosClient.get<EventMessageDetails>(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching event message details:', error);
    throw error;
  }
};

