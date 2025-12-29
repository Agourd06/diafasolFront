/**
 * Booking Room Days API Client
 * 
 * Handles all API calls for booking room days (Step 3)
 */

import axiosClient from '@/api/axiosClient';
import type {
  BookingRoomDay,
  CreateBookingRoomDayPayload,
  UpdateBookingRoomDayPayload,
} from '../types';

const BASE_URL = '/booking-room-days';

/**
 * Create a new booking room day (Step 3)
 */
export const createBookingRoomDay = async (payload: CreateBookingRoomDayPayload): Promise<BookingRoomDay> => {
  try {
    console.log('📤 Creating booking room day:', payload);
    
    const cleanPayload = { ...payload };
    if ('companyId' in cleanPayload) {
      delete (cleanPayload as any).companyId;
    }
    
    const response = await axiosClient.post<BookingRoomDay>(BASE_URL, cleanPayload);
    console.log('✅ Booking room day created successfully:', response.data.id);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating booking room day:', error);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Get a single booking room day by ID
 */
export const getBookingRoomDayById = async (id: string): Promise<BookingRoomDay> => {
  try {
    const response = await axiosClient.get<BookingRoomDay>(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching booking room day:', error);
    throw error;
  }
};

/**
 * Update a booking room day
 */
export const updateBookingRoomDay = async (id: string, payload: UpdateBookingRoomDayPayload): Promise<BookingRoomDay> => {
  try {
    console.log('📤 Updating booking room day:', id, payload);
    
    const cleanPayload = { ...payload };
    if ('companyId' in cleanPayload) {
      delete (cleanPayload as any).companyId;
    }
    
    const response = await axiosClient.patch<BookingRoomDay>(`${BASE_URL}/${id}`, cleanPayload);
    console.log('✅ Booking room day updated successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating booking room day:', error);
    throw error;
  }
};

/**
 * Delete a booking room day
 */
export const deleteBookingRoomDay = async (id: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting booking room day:', id);
    await axiosClient.delete(`${BASE_URL}/${id}`);
    console.log('✅ Booking room day deleted successfully');
  } catch (error: any) {
    console.error('❌ Error deleting booking room day:', error);
    throw error;
  }
};

