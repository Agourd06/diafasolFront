/**
 * Booking Form Validation
 * 
 * Validation rules for the main booking form (Step 1)
 */

import type { BookingStatus } from '../types';

export interface BookingFormData {
  propertyId: string;
  status: BookingStatus;
  arrivalDate: string;
  departureDate: string;
  amount: string;
  uniqueId: string;
  otaReservationCode: string;
  otaName: string;
  arrivalHour: string;
  otaCommission: string;
  currency: string;
  notes: string;
  adultsCount: number;
  childrenCount: number;
  infantsCount: number;
}

export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Validate the booking form data
 */
export const validateBookingForm = (formData: BookingFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Required fields
  if (!formData.propertyId) errors.propertyId = 'Property is required';
  if (!formData.status) errors.status = 'Status is required';
  if (!formData.arrivalDate) errors.arrivalDate = 'Arrival date is required';
  if (!formData.departureDate) errors.departureDate = 'Departure date is required';
  if (!formData.amount) errors.amount = 'Amount is required';

  // Validate amount is a positive number
  if (formData.amount) {
    const amountValue = parseFloat(formData.amount);
    if (isNaN(amountValue)) {
      errors.amount = 'Amount must be a valid number';
    } else if (amountValue <= 0) {
      errors.amount = 'Amount must be greater than 0';
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.amount)) {
      errors.amount = 'Amount must have at most 2 decimal places';
    }
  }

  // Validate dates - departure must be after arrival
  if (formData.arrivalDate && formData.departureDate) {
    const arrival = new Date(formData.arrivalDate);
    const departure = new Date(formData.departureDate);
    
    if (departure <= arrival) {
      errors.departureDate = 'Departure date must be after arrival date';
    }
    
    // Optional: Check if dates are not too far in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const arrivalDate = new Date(formData.arrivalDate);
    arrivalDate.setHours(0, 0, 0, 0);
    
    if (arrivalDate < today) {
      const daysDiff = Math.floor((today.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 365) {
        errors.arrivalDate = 'Arrival date is too far in the past (more than 1 year ago)';
      }
    }
  }

  // Validate unique ID format (e.g., BDC-1556013801)
  if (formData.uniqueId?.trim()) {
    const uniqueIdPattern = /^[A-Z]{2,4}-\d{6,}$/;
    if (!uniqueIdPattern.test(formData.uniqueId.trim())) {
      errors.uniqueId = 'Unique ID must be in format: ABC-123456 (e.g., BDC-1556013801)';
    }
  }

  // Validate OTA reservation code is a number
  if (formData.otaReservationCode?.trim()) {
    if (!/^\d+$/.test(formData.otaReservationCode.trim())) {
      errors.otaReservationCode = 'OTA Reservation Code must be a number';
    }
  }

  // Validate OTA commission is a valid positive number
  if (formData.otaCommission?.trim()) {
    const commissionValue = parseFloat(formData.otaCommission);
    if (isNaN(commissionValue)) {
      errors.otaCommission = 'OTA Commission must be a valid number';
    } else if (commissionValue < 0) {
      errors.otaCommission = 'OTA Commission cannot be negative';
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.otaCommission.trim())) {
      errors.otaCommission = 'OTA Commission must have at most 2 decimal places';
    }
  }

  return errors;
};

/**
 * Validate a single field
 */
export const validateBookingField = (
  fieldName: keyof BookingFormData,
  value: any,
  formData: BookingFormData
): string | undefined => {
  const errors = validateBookingForm({ ...formData, [fieldName]: value });
  return errors[fieldName];
};

