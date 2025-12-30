/**
 * Guest Form Validation
 * 
 * Validation rules for the guest form (Step 6)
 */

import type { CreateBookingGuestPayload } from '../types';

export interface GuestFormData extends Omit<CreateBookingGuestPayload, 'bookingId'> {
  // All fields from CreateBookingGuestPayload except bookingId
}

export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Validate the guest form data
 * Guest information is required, company information is optional
 */
export const validateGuestForm = (formData: GuestFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  // First Name validation - REQUIRED
  if (!formData.firstName || formData.firstName.trim().length === 0) {
    errors.firstName = 'First name is required';
  } else if (formData.firstName.length > 100) {
    errors.firstName = 'First name must be less than 100 characters';
  }

  // Last Name validation - REQUIRED
  if (!formData.lastName || formData.lastName.trim().length === 0) {
    errors.lastName = 'Last name is required';
  } else if (formData.lastName.length > 100) {
    errors.lastName = 'Last name must be less than 100 characters';
  }

  // Email validation - REQUIRED
  if (!formData.email || formData.email.trim().length === 0) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Invalid email address format';
  } else if (formData.email.length > 255) {
    errors.email = 'Email must be less than 255 characters';
  }

  // Phone validation - REQUIRED
  if (!formData.phone || formData.phone.trim().length === 0) {
    errors.phone = 'Phone is required';
  } else if (formData.phone.length > 50) {
    errors.phone = 'Phone must be less than 50 characters';
  } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
    errors.phone = 'Phone number contains invalid characters';
  }

  // Language validation - REQUIRED, should be 2 characters (ISO 639-1)
  if (!formData.language || formData.language.trim().length === 0) {
    errors.language = 'Language is required';
  } else if (formData.language.length !== 2) {
    errors.language = 'Language must be a 2-character code (e.g., en, fr, es)';
  } else if (!/^[a-z]{2}$/i.test(formData.language)) {
    errors.language = 'Language must contain only letters';
  }

  // Country validation - REQUIRED, should be 2 characters (ISO 3166-1 alpha-2)
  if (!formData.country || formData.country.trim().length === 0) {
    errors.country = 'Country is required';
  } else if (formData.country.length !== 2) {
    errors.country = 'Country must be a 2-character code (e.g., US, GB, FR)';
  } else if (!/^[A-Z]{2}$/.test(formData.country)) {
    errors.country = 'Country must be 2 uppercase letters';
  }

  // Address validation - REQUIRED
  if (!formData.address || formData.address.trim().length === 0) {
    errors.address = 'Address is required';
  } else if (formData.address.length > 255) {
    errors.address = 'Address must be less than 255 characters';
  }

  // City validation - REQUIRED
  if (!formData.city || formData.city.trim().length === 0) {
    errors.city = 'City is required';
  } else if (formData.city.length > 100) {
    errors.city = 'City must be less than 100 characters';
  }

  // ZIP/Postal Code validation - REQUIRED
  if (!formData.zip || formData.zip.trim().length === 0) {
    errors.zip = 'ZIP/Postal code is required';
  } else if (formData.zip.length > 20) {
    errors.zip = 'ZIP/Postal code must be less than 20 characters';
  }

  // Company Name validation - if provided, must not be empty
  if (formData.companyName) {
    if (formData.companyName.trim().length === 0) {
      errors.companyName = 'Company name cannot be empty';
    } else if (formData.companyName.length > 255) {
      errors.companyName = 'Company name must be less than 255 characters';
    }
  }

  // Company Number validation - if company name is provided, company number should be too
  if (formData.companyName && formData.companyName.trim().length > 0 && !formData.companyNumber) {
    errors.companyNumber = 'Company number is required when company name is provided';
  } else if (formData.companyNumber) {
    if (formData.companyNumber.trim().length === 0) {
      errors.companyNumber = 'Company number cannot be empty';
    } else if (formData.companyNumber.length > 100) {
      errors.companyNumber = 'Company number must be less than 100 characters';
    }
  }

  // Company Type validation - if provided, validate length
  if (formData.companyType && formData.companyType.length > 50) {
    errors.companyType = 'Company type must be less than 50 characters';
  }

  return errors;
};

/**
 * Validate a single field
 */
export const validateGuestField = (
  fieldName: keyof GuestFormData,
  value: any,
  formData: GuestFormData
): string | undefined => {
  const errors = validateGuestForm({ ...formData, [fieldName]: value });
  return errors[fieldName];
};

