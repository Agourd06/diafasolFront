/**
 * Booking Services API Client
 * 
 * Handles all API calls for booking services (Step 4)
 */

import axiosClient from '@/api/axiosClient';
import type {
  BookingService,
  CreateBookingServicePayload,
  UpdateBookingServicePayload,
} from '../types';

const BASE_URL = '/booking-services';

/**
 * Create a new booking service (Step 4)
 */
export const createBookingService = async (payload: CreateBookingServicePayload): Promise<BookingService> => {
  try {
    console.log('📤 Creating booking service:', payload);
    
    const cleanPayload = { ...payload };
    if ('companyId' in cleanPayload) {
      delete (cleanPayload as any).companyId;
    }
    
    const response = await axiosClient.post<BookingService>(BASE_URL, cleanPayload);
    console.log('✅ Booking service created successfully:', response.data.id);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating booking service:', error);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Get a single booking service by ID
 */
export const getBookingServiceById = async (id: string): Promise<BookingService> => {
  try {
    const response = await axiosClient.get<BookingService>(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching booking service:', error);
    throw error;
  }
};

/**
 * Update a booking service
 */
export const updateBookingService = async (id: string, payload: UpdateBookingServicePayload): Promise<BookingService> => {
  try {
    console.log('📤 Updating booking service:', id, payload);
    
    const cleanPayload = { ...payload };
    if ('companyId' in cleanPayload) {
      delete (cleanPayload as any).companyId;
    }
    
    const response = await axiosClient.patch<BookingService>(`${BASE_URL}/${id}`, cleanPayload);
    console.log('✅ Booking service updated successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating booking service:', error);
    throw error;
  }
};

/**
 * Delete a booking service
 */
export const deleteBookingService = async (id: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting booking service:', id);
    await axiosClient.delete(`${BASE_URL}/${id}`);
    console.log('✅ Booking service deleted successfully');
  } catch (error: any) {
    console.error('❌ Error deleting booking service:', error);
    throw error;
  }
};

