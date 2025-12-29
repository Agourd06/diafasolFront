/**
 * Events API Client
 * 
 * Handles API calls for events CRUD operations.
 * All endpoints require JWT authentication.
 * The companyId is automatically extracted from the token.
 */

import axiosClient from './axiosClient';
import type {
  EventMessage,
  CreateEventMessagePayload,
} from '@/features/event-messages/types';

const BASE_URL = '/events';

/**
 * Create a new event
 * POST /api/events
 * 
 * ⚠️ WARNING: Do NOT include companyId in the payload!
 * The companyId is automatically extracted from the JWT token.
 */
export const createEventMessage = async (
  payload: CreateEventMessagePayload
): Promise<EventMessage> => {
  try {
    console.log('📤 Creating event message:', payload);
    
    // Ensure companyId is NOT in the payload
    const cleanPayload = { ...payload };
    if ('companyId' in cleanPayload) {
      console.warn('⚠️ Removing companyId from payload - it is auto-set from JWT token');
      delete (cleanPayload as any).companyId;
    }
    
    const response = await axiosClient.post<EventMessage>(BASE_URL, cleanPayload);
    console.log('✅ Event message created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating event message:', error);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Get all events with pagination and filters
 * GET /api/events
 * 
 * @param params - Query parameters for filtering and pagination
 */
export interface GetEventsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  eventType?: string;
}

export interface GetEventsResponse {
  data: EventMessage[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getEvents = async (params?: GetEventsParams): Promise<GetEventsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.eventType) queryParams.append('eventType', params.eventType);

    const response = await axiosClient.get<GetEventsResponse>(
      `${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching events:', error);
    throw error;
  }
};

/**
 * Get an event by ID with details
 * GET /api/events/:id
 */
export const getEventMessageById = async (id: string): Promise<EventMessage> => {
  try {
    const response = await axiosClient.get<EventMessage>(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching event message:', error);
    throw error;
  }
};

