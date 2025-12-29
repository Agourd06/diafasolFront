/**
 * Booking Guests API Client
 * 
 * Handles all API calls for booking guests (Step 6)
 */

import axiosClient from '@/api/axiosClient';
import type {
  BookingGuest,
  CreateBookingGuestPayload,
  UpdateBookingGuestPayload,
} from '../types';

const BASE_URL = '/booking-guests';

/**
 * Create a new booking guest (Step 6)
 */
export const createBookingGuest = async (payload: CreateBookingGuestPayload): Promise<BookingGuest> => {
  try {
    console.log('📤 Creating booking guest:', payload);
    
    const cleanPayload = { ...payload };
    if ('companyId' in cleanPayload) {
      delete (cleanPayload as any).companyId;
    }
    
    const response = await axiosClient.post<BookingGuest>(BASE_URL, cleanPayload);
    console.log('✅ Booking guest created successfully:', response.data.id);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating booking guest:', error);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Get a single booking guest by ID
 */
export const getBookingGuestById = async (id: string): Promise<BookingGuest> => {
  try {
    const response = await axiosClient.get<BookingGuest>(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching booking guest:', error);
    throw error;
  }
};

/**
 * Update a booking guest
 */
export const updateBookingGuest = async (id: string, payload: UpdateBookingGuestPayload): Promise<BookingGuest> => {
  try {
    console.log('📤 Updating booking guest:', id, payload);
    
    const cleanPayload = { ...payload };
    if ('companyId' in cleanPayload) {
      delete (cleanPayload as any).companyId;
    }
    
    const response = await axiosClient.patch<BookingGuest>(`${BASE_URL}/${id}`, cleanPayload);
    console.log('✅ Booking guest updated successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating booking guest:', error);
    throw error;
  }
};

/**
 * Delete a booking guest
 */
export const deleteBookingGuest = async (id: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting booking guest:', id);
    await axiosClient.delete(`${BASE_URL}/${id}`);
    console.log('✅ Booking guest deleted successfully');
  } catch (error: any) {
    console.error('❌ Error deleting booking guest:', error);
    throw error;
  }
};

