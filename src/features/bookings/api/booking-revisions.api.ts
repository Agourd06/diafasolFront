/**
 * Booking Revisions API Client
 * 
 * Handles all API calls for booking revisions (Step 7 - Audit Trail)
 */

import axiosClient from '@/api/axiosClient';
import type {
  BookingRevision,
  CreateBookingRevisionPayload,
  UpdateBookingRevisionPayload,
} from '../types';

const BASE_URL = '/booking-revisions';

/**
 * Create a new booking revision (Step 7)
 */
export const createBookingRevision = async (payload: CreateBookingRevisionPayload): Promise<BookingRevision> => {
  try {
    console.log('📤 Creating booking revision:', payload);
    
    const cleanPayload = { ...payload };
    if ('companyId' in cleanPayload) {
      delete (cleanPayload as any).companyId;
    }
    
    const response = await axiosClient.post<BookingRevision>(BASE_URL, cleanPayload);
    console.log('✅ Booking revision created successfully:', response.data.id);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating booking revision:', error);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Get a single booking revision by ID
 */
export const getBookingRevisionById = async (id: string): Promise<BookingRevision> => {
  try {
    const response = await axiosClient.get<BookingRevision>(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching booking revision:', error);
    throw error;
  }
};

/**
 * Update a booking revision
 */
export const updateBookingRevision = async (id: string, payload: UpdateBookingRevisionPayload): Promise<BookingRevision> => {
  try {
    console.log('📤 Updating booking revision:', id, payload);
    
    const cleanPayload = { ...payload };
    if ('companyId' in cleanPayload) {
      delete (cleanPayload as any).companyId;
    }
    
    const response = await axiosClient.patch<BookingRevision>(`${BASE_URL}/${id}`, cleanPayload);
    console.log('✅ Booking revision updated successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating booking revision:', error);
    throw error;
  }
};

/**
 * Delete a booking revision
 */
export const deleteBookingRevision = async (id: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting booking revision:', id);
    await axiosClient.delete(`${BASE_URL}/${id}`);
    console.log('✅ Booking revision deleted successfully');
  } catch (error: any) {
    console.error('❌ Error deleting booking revision:', error);
    throw error;
  }
};

