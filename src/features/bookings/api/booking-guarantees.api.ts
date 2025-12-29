/**
 * Booking Guarantees API Client
 * 
 * Handles all API calls for booking guarantees (Step 5)
 */

import axiosClient from '@/api/axiosClient';
import type {
  BookingGuarantee,
  CreateBookingGuaranteePayload,
  UpdateBookingGuaranteePayload,
} from '../types';

const BASE_URL = '/booking-guarantees';

/**
 * Create a new booking guarantee (Step 5)
 */
export const createBookingGuarantee = async (payload: CreateBookingGuaranteePayload): Promise<BookingGuarantee> => {
  try {
    console.log('📤 Creating booking guarantee:', payload);
    
    const cleanPayload = { ...payload };
    if ('companyId' in cleanPayload) {
      delete (cleanPayload as any).companyId;
    }
    
    const response = await axiosClient.post<BookingGuarantee>(BASE_URL, cleanPayload);
    console.log('✅ Booking guarantee created successfully:', response.data.id);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating booking guarantee:', error);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Get a single booking guarantee by ID
 */
export const getBookingGuaranteeById = async (id: string): Promise<BookingGuarantee> => {
  try {
    const response = await axiosClient.get<BookingGuarantee>(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching booking guarantee:', error);
    throw error;
  }
};

/**
 * Update a booking guarantee
 */
export const updateBookingGuarantee = async (id: string, payload: UpdateBookingGuaranteePayload): Promise<BookingGuarantee> => {
  try {
    console.log('📤 Updating booking guarantee:', id, payload);
    
    const cleanPayload = { ...payload };
    if ('companyId' in cleanPayload) {
      delete (cleanPayload as any).companyId;
    }
    
    const response = await axiosClient.patch<BookingGuarantee>(`${BASE_URL}/${id}`, cleanPayload);
    console.log('✅ Booking guarantee updated successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating booking guarantee:', error);
    throw error;
  }
};

/**
 * Delete a booking guarantee
 */
export const deleteBookingGuarantee = async (id: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting booking guarantee:', id);
    await axiosClient.delete(`${BASE_URL}/${id}`);
    console.log('✅ Booking guarantee deleted successfully');
  } catch (error: any) {
    console.error('❌ Error deleting booking guarantee:', error);
    throw error;
  }
};

