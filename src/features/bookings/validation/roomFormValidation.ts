/**
 * Room Form Validation
 * 
 * Validation rules for the room form (Step 2)
 */

import type { CreateBookingRoomPayload } from '../types';

export interface RoomFormData extends Omit<CreateBookingRoomPayload, 'bookingId'> {
  // All fields from CreateBookingRoomPayload except bookingId
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface BookingContext {
  arrivalDate?: string;
  departureDate?: string;
}

/**
 * Validate the room form data
 */
export const validateRoomForm = (
  formData: RoomFormData,
  bookingContext?: BookingContext
): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Required fields
  if (!formData.roomTypeId) errors.roomTypeId = 'Room type is required';
  if (!formData.ratePlanId) errors.ratePlanId = 'Rate plan is required';
  if (!formData.checkinDate) errors.checkinDate = 'Check-in date is required';
  if (!formData.checkoutDate) errors.checkoutDate = 'Check-out date is required';

  // Validate dates - checkout must be after checkin
  if (formData.checkinDate && formData.checkoutDate) {
    const checkin = new Date(formData.checkinDate);
    const checkout = new Date(formData.checkoutDate);
    
    if (checkout <= checkin) {
      errors.checkoutDate = 'Check-out date must be after check-in date';
    }
    
    // Validate against booking dates if available
    if (bookingContext?.arrivalDate && bookingContext?.departureDate) {
      const bookingArrival = new Date(bookingContext.arrivalDate);
      const bookingDeparture = new Date(bookingContext.departureDate);
      
      if (checkin < bookingArrival) {
        errors.checkinDate = 'Check-in cannot be before booking arrival date';
      }
      if (checkout > bookingDeparture) {
        errors.checkoutDate = 'Check-out cannot be after booking departure date';
      }
    }
  }

  // Validate amount if provided
  if (formData.amount !== undefined && formData.amount !== null && String(formData.amount).trim() !== '') {
    const amountValue = parseFloat(String(formData.amount));
    if (isNaN(amountValue)) {
      errors.amount = 'Amount must be a valid number';
    } else if (amountValue < 0) {
      errors.amount = 'Amount cannot be negative';
    } else if (!/^\d+(\.\d{1,2})?$/.test(String(formData.amount))) {
      errors.amount = 'Amount must have at most 2 decimal places';
    }
  }

  // Validate occupancy - at least one person required
  const totalGuests = (formData.adults || 0) + (formData.children || 0) + (formData.infants || 0);
  if (totalGuests === 0) {
    errors.adults = 'At least one guest is required';
  }

  return errors;
};

/**
 * Validate a single field
 */
export const validateRoomField = (
  fieldName: keyof RoomFormData,
  value: any,
  formData: RoomFormData,
  bookingContext?: BookingContext
): string | undefined => {
  const errors = validateRoomForm({ ...formData, [fieldName]: value }, bookingContext);
  return errors[fieldName];
};

