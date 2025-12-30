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
 * Get all booking rooms for a booking
 * GET /api/booking-rooms?bookingId={bookingId}
 */
export interface GetBookingRoomsParams {
  bookingId: string;
  includeDays?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface BookingRoomWithDays extends BookingRoom {
  hasRoomDays: boolean;
  daysCount: number;
  days?: Array<{
    id: string;
    bookingRoomId: string;
    stayDate: string;
    price: number;
  }>;
}

export interface GetBookingRoomsResponse {
  data: BookingRoomWithDays[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getBookingRoomsByBookingId = async (
  params: GetBookingRoomsParams
): Promise<GetBookingRoomsResponse> => {
  try {
    console.log('📤 Fetching booking rooms:', params);
    
    const queryParams = new URLSearchParams();
    queryParams.append('bookingId', params.bookingId);
    if (params.includeDays) {
      queryParams.append('includeDays', 'true');
    }
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params.search) {
      queryParams.append('search', params.search);
    }
    if (params.sortBy) {
      queryParams.append('sortBy', params.sortBy);
    }
    if (params.sortOrder) {
      queryParams.append('sortOrder', params.sortOrder);
    }

    const response = await axiosClient.get<GetBookingRoomsResponse>(
      `${BASE_URL}?${queryParams.toString()}`
    );
    console.log('✅ Booking rooms fetched:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching booking rooms:', error);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
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

