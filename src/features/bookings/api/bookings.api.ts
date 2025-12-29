/**
 * Bookings API Client
 * 
 * Handles all API calls for the main booking resource
 */

import axiosClient from '@/api/axiosClient';
import type {
  Booking,
  CompleteBooking,
  CreateBookingPayload,
  UpdateBookingPayload,
  GetBookingsParams,
  GetBookingsResponse,
} from '../types';

const BASE_URL = '/bookings';

/**
 * Create a new booking (Step 1)
 */
export const createBooking = async (payload: CreateBookingPayload): Promise<Booking> => {
  try {
    console.log('📤 Creating booking:', payload);
    
    // Clean payload - remove any fields that shouldn't be sent
    const cleanPayload: any = { ...payload };
    
    // Remove companyId if present (auto-set from JWT)
    if ('companyId' in cleanPayload) {
      console.warn('⚠️ Removing companyId from payload - it is auto-set from JWT token');
      delete cleanPayload.companyId;
    }
    
    // Ensure occupancy values are numbers (not strings)
    if (cleanPayload.occupancy) {
      cleanPayload.occupancy = {
        adults: Number(cleanPayload.occupancy.adults) || 0,
        children: Number(cleanPayload.occupancy.children) || 0,
        infants: Number(cleanPayload.occupancy.infants) || 0,
      };
    }
    
    // Ensure amount is a string (not number)
    if (typeof cleanPayload.amount === 'number') {
      cleanPayload.amount = cleanPayload.amount.toFixed(2);
    }
    
    console.log('📤 Cleaned payload:', JSON.stringify(cleanPayload, null, 2));
    
    const response = await axiosClient.post<Booking>(BASE_URL, cleanPayload);
    console.log('✅ Booking created successfully:', response.data.id);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating booking:', error);
    if (error.response?.data) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Request payload was:', JSON.stringify(payload, null, 2));
    }
    throw error;
  }
};

/**
 * Get a single booking by ID (with nested data)
 */
export const getBookingById = async (id: string): Promise<CompleteBooking> => {
  try {
    const response = await axiosClient.get<CompleteBooking>(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching booking:', error);
    throw error;
  }
};

/**
 * Get paginated list of bookings with filters
 */
export const getBookings = async (params: GetBookingsParams = {}): Promise<GetBookingsResponse> => {
  try {
    const response = await axiosClient.get<GetBookingsResponse>(BASE_URL, { params });
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching bookings:', error);
    throw error;
  }
};

/**
 * Update a booking
 */
export const updateBooking = async (id: string, payload: UpdateBookingPayload): Promise<Booking> => {
  try {
    console.log('📤 Updating booking:', id, payload);
    
    const cleanPayload = { ...payload };
    if ('companyId' in cleanPayload) {
      delete (cleanPayload as any).companyId;
    }
    
    const response = await axiosClient.patch<Booking>(`${BASE_URL}/${id}`, cleanPayload);
    console.log('✅ Booking updated successfully:', response.data.id);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating booking:', error);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Delete a booking
 */
export const deleteBooking = async (id: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting booking:', id);
    await axiosClient.delete(`${BASE_URL}/${id}`);
    console.log('✅ Booking deleted successfully');
  } catch (error: any) {
    console.error('❌ Error deleting booking:', error);
    throw error;
  }
};

