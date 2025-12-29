/**
 * Booking Types and Interfaces
 * 
 * Complete type definitions for the booking system
 * Following the API structure from the backend
 */

// ============================================================================
// Enums and Constants
// ============================================================================

export type BookingStatus =
  | 'new'
  | 'pending'
  | 'confirmed'
  | 'modified'
  | 'cancelled'
  | 'checked_in'
  | 'checked_out';

export type RevisionStatus = 'new' | 'modified' | 'cancelled';

export type CardType = 'visa' | 'mastercard' | 'amex' | 'discover' | 'other';

export const BOOKING_STATUSES: BookingStatus[] = [
  'new',
  'pending',
  'confirmed',
  'modified',
  'cancelled',
  'checked_in',
  'checked_out',
];

export const STATUS_COLORS: Record<BookingStatus, string> = {
  new: 'bg-blue-100 text-blue-800 border-blue-300',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-green-100 text-green-800 border-green-300',
  modified: 'bg-purple-100 text-purple-800 border-purple-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
  checked_in: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  checked_out: 'bg-gray-100 text-gray-800 border-gray-300',
};

// ============================================================================
// Step 1: Booking (Main Record)
// ============================================================================

export interface Occupancy {
  adults: number; // Required number, not string!
  children: number; // Required number, not string!
  infants: number; // Required number, not string!
}

export interface Booking {
  id: string;
  companyId: string;
  propertyId: string;
  status: BookingStatus;
  arrivalDate: string; // YYYY-MM-DD
  departureDate: string; // YYYY-MM-DD
  amount: string; // "220.00"
  uniqueId?: string | null;
  otaReservationCode?: string | null;
  otaName?: string | null;
  revisionId?: string | null;
  arrivalHour?: string | null;
  otaCommission?: string | null;
  currency?: string | null;
  notes?: string | null;
  insertedAt?: string | null; // ISO date string
  occupancy?: Occupancy | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingPayload {
  propertyId: string;
  status: BookingStatus;
  arrivalDate: string;
  departureDate: string;
  amount: string; // String format: "220.00"
  uniqueId?: string;
  otaReservationCode?: string;
  otaName?: string;
  revisionId?: string;
  arrivalHour?: string;
  otaCommission?: string;
  currency?: string; // ISO 4217 code (EUR, USD, GBP, JPY, CNY, MAD)
  notes?: string;
  insertedAt?: string;
  occupancy?: Occupancy; // Only nested object allowed - stored as flat columns in database
}

export interface UpdateBookingPayload extends Partial<CreateBookingPayload> {}

// ============================================================================
// Step 2: Booking Rooms
// ============================================================================

export interface BookingRoom {
  id: string;
  companyId: string;
  bookingId: string;
  roomTypeId: string;
  ratePlanId: string;
  checkinDate: string; // YYYY-MM-DD
  checkoutDate: string; // YYYY-MM-DD
  adults: number;
  children: number;
  infants: number;
  amount?: number | null;
  otaUniqueId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRoomPayload {
  bookingId: string;
  roomTypeId: string;
  ratePlanId: string;
  checkinDate: string;
  checkoutDate: string;
  adults: number;
  children: number;
  infants: number;
  amount?: number;
  otaUniqueId?: string;
}

export interface UpdateBookingRoomPayload extends Partial<Omit<CreateBookingRoomPayload, 'bookingId'>> {}

// ============================================================================
// Step 3: Booking Room Days
// ============================================================================

export interface BookingRoomDay {
  id: string;
  companyId: string;
  bookingRoomId: string;
  stayDate: string; // YYYY-MM-DD
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRoomDayPayload {
  bookingRoomId: string;
  stayDate: string;
  price: number;
}

export interface UpdateBookingRoomDayPayload extends Partial<Omit<CreateBookingRoomDayPayload, 'bookingRoomId'>> {}

// ============================================================================
// Step 4: Booking Services
// ============================================================================

export interface BookingService {
  id: string;
  companyId: string;
  bookingId: string;
  serviceType?: string | null;
  name?: string | null;
  priceMode?: string | null;
  persons?: number | null;
  nights?: number | null;
  pricePerUnit?: number | null;
  totalPrice?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingServicePayload {
  bookingId: string;
  serviceType?: string;
  name?: string;
  priceMode?: string;
  persons?: number;
  nights?: number;
  pricePerUnit?: number;
  totalPrice?: number;
}

export interface UpdateBookingServicePayload extends Partial<Omit<CreateBookingServicePayload, 'bookingId'>> {}

// ============================================================================
// Step 5: Booking Guarantee
// ============================================================================

export interface BookingGuarantee {
  id: string;
  companyId: string;
  bookingId: string;
  cardType?: string | null;
  cardHolderName?: string | null;
  maskedCardNumber?: string | null;
  expirationDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingGuaranteePayload {
  bookingId: string;
  cardType?: string;
  cardHolderName?: string;
  maskedCardNumber?: string;
  expirationDate?: string;
}

export interface UpdateBookingGuaranteePayload extends Partial<Omit<CreateBookingGuaranteePayload, 'bookingId'>> {}

// ============================================================================
// Step 6: Booking Guest/Customer
// ============================================================================

export interface BookingGuest {
  id: string;
  companyId: string;
  bookingId: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  language?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  zip?: string | null;
  companyName?: string | null;
  companyNumber?: string | null;
  companyNumberType?: string | null;
  companyType?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingGuestPayload {
  bookingId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  language?: string;
  country?: string;
  city?: string;
  address?: string;
  zip?: string;
  companyName?: string;
  companyNumber?: string;
  companyNumberType?: string;
  companyType?: string;
}

export interface UpdateBookingGuestPayload extends Partial<Omit<CreateBookingGuestPayload, 'bookingId'>> {}

// ============================================================================
// Step 7: Booking Revision (Audit Trail)
// ============================================================================

export interface BookingRevision {
  id: string;
  companyId: string;
  bookingId: string;
  status: RevisionStatus;
  rawPayload?: any;
  acked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRevisionPayload {
  id: string; // External revision ID
  bookingId: string;
  status: RevisionStatus;
  rawPayload?: any;
  acked?: boolean;
}

export interface UpdateBookingRevisionPayload extends Partial<Omit<CreateBookingRevisionPayload, 'id' | 'bookingId'>> {}

// ============================================================================
// Complete Booking (with nested data)
// ============================================================================

export interface CompleteBooking extends Booking {
  rooms?: BookingRoom[];
  services?: BookingService[];
  guarantee?: BookingGuarantee | null;
  guest?: BookingGuest | null;
  revisions?: BookingRevision[];
}

// ============================================================================
// API Response Types
// ============================================================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetBookingsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  propertyId?: string;
  status?: BookingStatus;
}

export interface GetBookingsResponse {
  data: Booking[];
  meta: PaginationMeta;
}

// ============================================================================
// Multi-Step Wizard State
// ============================================================================

export interface BookingWizardState {
  currentStep: number;
  completedSteps: number[];
  booking: Partial<CreateBookingPayload> | null;
  bookingId: string | null;
  rooms: CreateBookingRoomPayload[];
  roomIds: { tempId: string; id: string }[];
  roomDays: { roomTempId: string; days: CreateBookingRoomDayPayload[] }[];
  services: CreateBookingServicePayload[];
  guarantee: CreateBookingGuaranteePayload | null;
  guest: CreateBookingGuestPayload | null;
  revision: Omit<CreateBookingRevisionPayload, 'bookingId'> | null;
}

export const BOOKING_STEPS = [
  { id: 1, label: 'Booking Info', description: 'Basic booking details' },
  { id: 2, label: 'Rooms', description: 'Add rooms to booking' },
  { id: 3, label: 'Room Days', description: 'Daily pricing breakdown' },
  { id: 4, label: 'Services', description: 'Additional services' },
  { id: 5, label: 'Guarantee', description: 'Payment guarantee' },
  { id: 6, label: 'Guest Info', description: 'Customer details' },
  { id: 7, label: 'Review', description: 'Review and confirm' },
] as const;

