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
 * 
 * Supports both:
 * - OTA bookings (without rooms array)
 * - Direct bookings from room search (with rooms array)
 */
export const createBooking = async (
  payload: CreateBookingPayload & { rooms?: Array<{
    roomTypeId: string;
    numberOfRooms: number;
    checkinDate: string;
    checkoutDate: string;
    adults: number;
    children: number;
    infants: number;
  }> }
): Promise<Booking & { rooms?: any[] }> => {
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
    
    // Backend expects camelCase format (arrivalDate, departureDate, propertyId, etc.)
    // DO NOT convert to snake_case - the backend validation rejects snake_case fields
    
    // Ensure rooms array values are numbers (keep camelCase format)
    if (cleanPayload.rooms && Array.isArray(cleanPayload.rooms)) {
      cleanPayload.rooms = cleanPayload.rooms.map((room: any) => ({
        roomTypeId: room.roomTypeId, // Keep camelCase
        numberOfRooms: Number(room.numberOfRooms) || 0, // Keep camelCase
        checkinDate: room.checkinDate, // Keep camelCase
        checkoutDate: room.checkoutDate, // Keep camelCase
        adults: Number(room.adults) || 0,
        children: Number(room.children) || 0,
        infants: Number(room.infants) || 0,
      }));
    }
    
    console.log('📤 Cleaned payload (camelCase):', JSON.stringify(cleanPayload, null, 2));
    
    const response = await axiosClient.post<Booking & { rooms?: any[] }>(BASE_URL, cleanPayload);
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
 * Transform snake_case API response to camelCase frontend format
 */
const transformBookingResponse = (apiResponse: any): CompleteBooking => {
  const attrs = apiResponse.attributes || apiResponse;
  
  return {
    id: attrs.id,
    companyId: attrs.company_id || '',
    propertyId: attrs.property_id,
    status: attrs.status,
    arrivalDate: attrs.arrival_date,
    departureDate: attrs.departure_date,
    amount: attrs.amount,
    bookingType: attrs.booking_type || (attrs.ota_reservation_code || attrs.ota_name ? 'ota' : 'internal'), // Infer from OTA fields if not set
    uniqueId: attrs.unique_id,
    otaReservationCode: attrs.ota_reservation_code,
    otaName: attrs.ota_name,
    revisionId: attrs.revision_id,
    arrivalHour: attrs.arrival_hour,
    otaCommission: attrs.ota_commission,
    currency: attrs.currency,
    notes: attrs.notes,
    insertedAt: attrs.inserted_at,
    occupancy: attrs.occupancy,
    createdAt: attrs.created_at || new Date().toISOString(),
    updatedAt: attrs.updated_at || new Date().toISOString(),
    
    // Transform nested rooms
    rooms: attrs.rooms?.map((room: any) => {
      console.log('🔄 Transforming room:', { rawRoom: room, roomId: room.id });
      return {
        id: room.id || '', // Keep empty string if no ID (will be handled in context)
        bookingId: attrs.id,
        roomTypeId: room.room_type_id,
        ratePlanId: room.rate_plan_id,
      guestsCount: room.guests_count || 0,
      adults: room.occupancy?.adults || room.adults || 0,
      children: room.occupancy?.children || room.children || 0,
      infants: room.occupancy?.infants || room.infants || 0,
      checkinDate: room.checkin_date,
      checkoutDate: room.checkout_date,
      stopSell: room.stop_sell || false,
      amount: room.amount,
      otaUniqueId: room.ota_unique_id,
      createdAt: room.created_at || new Date().toISOString(),
      updatedAt: room.updated_at || new Date().toISOString(),
      // Transform room days
      days: room.days ? Object.entries(room.days).map(([date, amount]) => ({
        id: `${room.id}-${date}`,
        bookingRoomId: room.id || '',
        date,
        amount: String(amount),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })) : [],
      };
    }) || [],
    
    // Transform services
    services: attrs.services?.map((service: any, index: number) => ({
      id: service.id || `service-${index}`,
      bookingId: attrs.id,
      type: service.type,
      totalPrice: service.total_price,
      pricePerUnit: service.price_per_unit,
      priceMode: service.price_mode,
      persons: service.persons,
      nights: service.nights,
      name: service.name,
      createdAt: service.created_at || new Date().toISOString(),
      updatedAt: service.updated_at || new Date().toISOString(),
    })) || [],
    
    // Transform guarantee (only first one)
    guarantees: attrs.guarantee ? [{
      ...(attrs.guarantee.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(attrs.guarantee.id) && { id: attrs.guarantee.id }),
      bookingId: attrs.id,
      cardType: attrs.guarantee.card_type,
      cardHolderName: attrs.guarantee.cardholder_name,
      maskedCardNumber: attrs.guarantee.card_number,
      expirationDate: attrs.guarantee.expiration_date,
      createdAt: attrs.guarantee.created_at || new Date().toISOString(),
      updatedAt: attrs.guarantee.updated_at || new Date().toISOString(),
    }] : [],
    
    // Transform guest data from customer field (API returns first guest as customer object)
    // Note: API returns customer field (not guests array), mapping fields:
    // - customer.name → firstName
    // - customer.surname → lastName  
    // - customer.mail → email
    // - customer.company.title → companyName
    guests: attrs.customer ? [{
      id: attrs.customer.id || 'guest-1',
      companyId: attrs.company_id || '',
      bookingId: attrs.id,
      firstName: attrs.customer.name || null,
      lastName: attrs.customer.surname || null,
      email: attrs.customer.mail || null,
      phone: attrs.customer.phone || null,
      address: attrs.customer.address || null,
      city: attrs.customer.city || null,
      zip: attrs.customer.zip || null,
      country: attrs.customer.country || null,
      language: attrs.customer.language || null,
      companyName: attrs.customer.company?.title || null,
      companyNumber: attrs.customer.company?.number || null,
      companyNumberType: attrs.customer.company?.number_type || null,
      companyType: attrs.customer.company?.type || null,
      createdAt: attrs.customer.created_at || new Date().toISOString(),
      updatedAt: attrs.customer.updated_at || new Date().toISOString(),
    }] : [],
    
    // Create singular guest property for convenience (maps from customer field)
    guest: attrs.customer ? {
      id: attrs.customer.id || 'guest-1',
      companyId: attrs.company_id || '',
      bookingId: attrs.id,
      firstName: attrs.customer.name || null,
      lastName: attrs.customer.surname || null,
      email: attrs.customer.mail || null,
      phone: attrs.customer.phone || null,
      address: attrs.customer.address || null,
      city: attrs.customer.city || null,
      zip: attrs.customer.zip || null,
      country: attrs.customer.country || null,
      language: attrs.customer.language || null,
      companyName: attrs.customer.company?.title || null,
      companyNumber: attrs.customer.company?.number || null,
      companyNumberType: attrs.customer.company?.number_type || null,
      companyType: attrs.customer.company?.type || null,
      createdAt: attrs.customer.created_at || new Date().toISOString(),
      updatedAt: attrs.customer.updated_at || new Date().toISOString(),
    } : null,
    
    // Revisions array (empty for now, would need separate API call)
    revisions: [],
  };
};

/**
 * Get a single booking by ID (with nested data)
 */
export const getBookingById = async (id: string): Promise<CompleteBooking> => {
  try {
    console.log('📤 Fetching booking:', id);
    const response = await axiosClient.get(`${BASE_URL}/${id}`);
    console.log('📥 Raw API response:', response.data);
    
    const transformed = transformBookingResponse(response.data);
    console.log('✅ Transformed booking:', transformed);
    
    return transformed;
  } catch (error: any) {
    console.error('❌ Error fetching booking:', error);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Transform a single booking from list response (simpler than full transform)
 */
const transformBookingListItem = (booking: any): Booking => {
  // Handle both snake_case and camelCase responses
  const attrs = booking.attributes || booking;
  
  return {
    id: attrs.id || booking.id,
    companyId: attrs.company_id || attrs.companyId || '',
    propertyId: attrs.property_id || attrs.propertyId,
    status: attrs.status,
    arrivalDate: attrs.arrival_date || attrs.arrivalDate,
    departureDate: attrs.departure_date || attrs.departureDate,
    amount: attrs.amount || '0.00',
    // Handle bookingType - infer from OTA fields if not present (backward compatibility)
    bookingType: attrs.booking_type || attrs.bookingType || 
      (attrs.ota_reservation_code || attrs.otaReservationCode || attrs.ota_name || attrs.otaName ? 'ota' : 'internal'),
    uniqueId: attrs.unique_id || attrs.uniqueId || null,
    otaReservationCode: attrs.ota_reservation_code || attrs.otaReservationCode || null,
    otaName: attrs.ota_name || attrs.otaName || null,
    revisionId: attrs.revision_id || attrs.revisionId || null,
    arrivalHour: attrs.arrival_hour || attrs.arrivalHour || null,
    otaCommission: attrs.ota_commission || attrs.otaCommission || null,
    currency: attrs.currency || null,
    notes: attrs.notes || null,
    insertedAt: attrs.inserted_at || attrs.insertedAt || null,
    occupancy: attrs.occupancy || null,
    createdAt: attrs.created_at || attrs.createdAt || new Date().toISOString(),
    updatedAt: attrs.updated_at || attrs.updatedAt || new Date().toISOString(),
  };
};

/**
 * Get paginated list of bookings with filters
 */
export const getBookings = async (params: GetBookingsParams = {}): Promise<GetBookingsResponse> => {
  try {
    const response = await axiosClient.get<any>(BASE_URL, { params });
    
    // Transform the response to handle missing booking_type gracefully
    const transformedData: GetBookingsResponse = {
      data: (response.data?.data || response.data || []).map((booking: any) => transformBookingListItem(booking)),
      meta: response.data?.meta || {
        page: params.page || 1,
        limit: params.limit || 20,
        total: 0,
        totalPages: 0,
      },
    };
    
    return transformedData;
  } catch (error: any) {
    console.error('❌ Error fetching bookings:', error);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
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

