/**
 * Attachments API Client
 * 
 * Handles API calls for attachments CRUD operations.
 * All endpoints require JWT authentication.
 * The companyId is automatically extracted from the token.
 */

import axiosClient from './axiosClient';
import type {
  Attachment,
  CreateAttachmentPayload,
} from '@/features/event-messages/types';

const BASE_URL = '/attachments';

/**
 * Create an attachment
 * POST /api/attachments
 * 
 * ⚠️ WARNING: Do NOT include companyId in the payload!
 * The companyId is automatically extracted from the JWT token.
 */
export const createAttachment = async (
  payload: CreateAttachmentPayload
): Promise<Attachment> => {
  try {
    console.log('📤 Creating attachment:', {
      eventDetailsId: payload.eventDetailsId,
      filename: payload.filename,
      type: payload.type,
      size: payload.size,
    });
    
    // Ensure companyId is NOT in the payload
    const cleanPayload = { ...payload };
    if ('companyId' in cleanPayload) {
      console.warn('⚠️ Removing companyId from payload - it is auto-set from JWT token');
      delete (cleanPayload as any).companyId;
    }
    
    const response = await axiosClient.post<Attachment>(BASE_URL, cleanPayload);
    console.log('✅ Attachment created successfully:', response.data.id);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating attachment:', error);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Get an attachment by ID
 * GET /api/attachments/:id
 */
export const getAttachmentById = async (id: string): Promise<Attachment> => {
  try {
    const response = await axiosClient.get<Attachment>(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching attachment:', error);
    throw error;
  }
};

