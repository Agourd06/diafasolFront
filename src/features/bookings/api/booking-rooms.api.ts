/**
 * Booking Rooms API Client
 * 
 * Handles all API calls for booking rooms (Step 2)
 */

import axiosClient from '@/api/axiosClient';
import type {
  BookingRoom,
  CreateBookingRoomPayload,
  UpdateBookingRoomPayload,
} from '../types';

const BASE_URL = '/booking-rooms';

/**
 * Create a new booking room (Step 2)
 */
export const createBookingRoom = async (payload: CreateBookingRoomPayload): Promise<BookingRoom> => {
  try {
    console.log('📤 Creating booking room:', payload);
    
    const cleanPayload = { ...payload };
    if ('companyId' in cleanPayload) {
      delete (cleanPayload as any).companyId;
    }
    
    const response = await axiosClient.post<BookingRoom>(BASE_URL, cleanPayload);
    console.log('✅ Booking room created successfully:', response.data.id);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating booking room:', error);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Get a single booking room by ID
 */
export const getBookingRoomById = async (id: string): Promise<BookingRoom> => {
  try {
    const response = await axiosClient.get<BookingRoom>(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching booking room:', error);
    throw error;
  }
};

/**
 * Update a booking room
 */
export const updateBookingRoom = async (id: string, payload: UpdateBookingRoomPayload): Promise<BookingRoom> => {
  try {
    console.log('📤 Updating booking room:', id, payload);
    
    const cleanPayload = { ...payload };
    if ('companyId' in cleanPayload) {
      delete (cleanPayload as any).companyId;
    }
    
    const response = await axiosClient.patch<BookingRoom>(`${BASE_URL}/${id}`, cleanPayload);
    console.log('✅ Booking room updated successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating booking room:', error);
    throw error;
  }
};

/**
 * Delete a booking room
 */
export const deleteBookingRoom = async (id: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting booking room:', id);
    await axiosClient.delete(`${BASE_URL}/${id}`);
    console.log('✅ Booking room deleted successfully');
  } catch (error: any) {
    console.error('❌ Error deleting booking room:', error);
    throw error;
  }
};

