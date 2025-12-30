/**
 * Guest Form - Step 6
 * 
 * Add customer/guest information
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateBookingGuest } from '../../hooks/useBookingMutations';
import { updateBookingGuest } from '../../api/booking-guests.api';
import { useBookingWizard } from '../../context/BookingWizardContext';
import { validateGuestForm } from '../../validation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const GuestForm: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { bookingId, setGuest, markStepCompleted, setCurrentStep, guest: existingGuest } = useBookingWizard();
  const createGuestMutation = useCreateBookingGuest();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    language: 'en',
    country: '',
    city: '',
    address: '',
    zip: '',
    companyName: '',
    companyNumber: '',
    companyNumberType: 'VAT',
    companyType: 'Registration Number',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingGuestId, setExistingGuestId] = useState<string | null>(null);

  // Load existing guest data when component mounts or guest changes
  useEffect(() => {
    if (existingGuest) {
      // Check if guest has a valid UUID ID (not a placeholder like 'guest-1')
      const guestId = (existingGuest as any).id;
      const isValidUUID = guestId &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(guestId);

      if (isValidUUID) {
        setExistingGuestId(guestId);
        console.log('✅ Found existing guest ID:', guestId);
      } else {
        setExistingGuestId(null);
        console.log('⚠️ Existing guest has invalid or no ID:', guestId);
      }

      // Load form data from existing guest
      setFormData({
        firstName: existingGuest.firstName || '',
        lastName: existingGuest.lastName || '',
        email: existingGuest.email || '',
        phone: existingGuest.phone || '',
        language: existingGuest.language || 'en',
        country: existingGuest.country || '',
        city: existingGuest.city || '',
        address: existingGuest.address || '',
        zip: existingGuest.zip || '',
        companyName: existingGuest.companyName || '',
        companyNumber: existingGuest.companyNumber || '',
        companyNumberType: existingGuest.companyNumberType || 'VAT',
        companyType: existingGuest.companyType || 'Registration Number',
      });
    } else {
      // Reset form if no guest
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        language: 'en',
        country: '',
        city: '',
        address: '',
        zip: '',
        companyName: '',
        companyNumber: '',
        companyNumberType: 'VAT',
        companyType: 'Registration Number',
      });
      setExistingGuestId(null);
    }
  }, [existingGuest]);

  const validate = (): boolean => {
    const validationErrors = validateGuestForm(formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSave = async () => {
    if (!bookingId) {
      console.error('No booking ID available');
      return;
    }

    if (!validate()) {
      return;
    }

    try {
      const payload = {
        bookingId,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        language: formData.language || undefined,
        country: formData.country || undefined,
        city: formData.city || undefined,
        address: formData.address || undefined,
        zip: formData.zip || undefined,
        companyName: formData.companyName || undefined,
        companyNumber: formData.companyNumber || undefined,
        companyNumberType: formData.companyNumberType || undefined,
        companyType: formData.companyType || undefined,
      };

      // Check if guest already exists - update instead of create
      // Only update if we have a valid UUID (not a placeholder)
      const isValidGuestId = existingGuestId &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(existingGuestId);

      let finalGuestId = existingGuestId;

      if (isValidGuestId) {
        console.log('📤 Updating existing booking guest:', existingGuestId, payload);
        await updateBookingGuest(existingGuestId, {
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          phone: payload.phone,
          language: payload.language,
          country: payload.country,
          city: payload.city,
          address: payload.address,
          zip: payload.zip,
          companyName: payload.companyName,
          companyNumber: payload.companyNumber,
          companyNumberType: payload.companyNumberType,
          companyType: payload.companyType,
        });
        // Invalidate booking query to refresh data
        queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
        console.log('✅ Booking guest updated successfully');
      } else {
        console.log('📤 Creating new booking guest with payload:', payload);
        const result = await createGuestMutation.mutateAsync(payload);
        // Store the ID for future updates
        finalGuestId = result.id;
        setExistingGuestId(result.id);
        console.log('✅ Booking guest created successfully:', result.id);
      }

      // Save to wizard state (include ID)
      setGuest({
        ...payload,
        id: finalGuestId,
      });
      markStepCompleted(6);
      setCurrentStep(7);
    } catch (error: any) {
      console.error('❌ Failed to save guest:', error);
      if (error.response?.data) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      alert(t('bookings.errors.saveGuestFailed', { defaultValue: 'Failed to save guest. Please check console for details.' }));
    }
  };

  const handleSkip = () => {
    markStepCompleted(6);
    setCurrentStep(7);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Auto-uppercase for country and language fields
    const processedValue = (name === 'country' || name === 'language') ? value.toUpperCase() : value;
    
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('bookings.guest.title', { defaultValue: 'Guest Information' })}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('bookings.labels.firstName', { defaultValue: 'First Name' })} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder={t('bookings.placeholders.firstName', { defaultValue: 'User' })}
              maxLength={100}
              required
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('bookings.labels.lastName', { defaultValue: 'Last Name' })} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder={t('bookings.placeholders.lastName', { defaultValue: 'Channex' })}
              maxLength={100}
              required
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('bookings.labels.email', { defaultValue: 'Email' })} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('bookings.placeholders.email', { defaultValue: 'user@channex.io' })}
              maxLength={255}
              required
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('bookings.labels.phone', { defaultValue: 'Phone' })} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t('bookings.placeholders.phone', { defaultValue: '1234567890' })}
              maxLength={50}
              required
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            <p className="text-xs text-gray-500 mt-1">{t('bookings.helpers.phoneFormat', { defaultValue: 'Format: digits, spaces, -, +, parentheses' })}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('bookings.labels.language', { defaultValue: 'Language' })} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="language"
              value={formData.language}
              onChange={handleChange}
              placeholder={t('bookings.placeholders.language', { defaultValue: 'en' })}
              maxLength={2}
              required
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.language ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.language && <p className="text-red-500 text-xs mt-1">{errors.language}</p>}
            <p className="text-xs text-gray-500 mt-1">{t('bookings.helpers.languageFormat', { defaultValue: '2-letter language code (ISO 639-1, e.g., en, fr, es)' })}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('bookings.labels.country', { defaultValue: 'Country' })} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder={t('bookings.placeholders.country', { defaultValue: 'NL' })}
              maxLength={2}
              required
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.country ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
            <p className="text-xs text-gray-500 mt-1">{t('bookings.helpers.countryFormat', { defaultValue: '2-letter country code (ISO 3166-1 alpha-2, e.g., US, GB, FR)' })}</p>
          </div>

          {/* Address Information */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('bookings.labels.address', { defaultValue: 'Address' })} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder={t('bookings.placeholders.address', { defaultValue: 'JW Lucasweg 35' })}
              maxLength={255}
              required
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('bookings.labels.city', { defaultValue: 'City' })} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder={t('bookings.placeholders.city', { defaultValue: 'Haarlem' })}
              maxLength={100}
              required
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('bookings.labels.zip', { defaultValue: 'ZIP/Postal Code' })} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              placeholder={t('bookings.placeholders.zip', { defaultValue: '2031 BE' })}
              maxLength={20}
              required
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.zip ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip}</p>}
          </div>

          {/* Company Information */}
          <div className="md:col-span-2 pt-4 border-t border-gray-200">
            <h4 className="text-md font-semibold text-gray-800 mb-4">{t('bookings.labels.companyInfo', { defaultValue: 'Company Information (Optional)' })}</h4>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('bookings.labels.companyName', { defaultValue: 'Company Name' })}</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder={t('bookings.placeholders.companyName', { defaultValue: 'Company Name' })}
              maxLength={255}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.companyName ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('bookings.labels.companyNumber', { defaultValue: 'Company Number' })} {formData.companyName && formData.companyName.trim() && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              name="companyNumber"
              value={formData.companyNumber}
              onChange={handleChange}
              placeholder={t('bookings.placeholders.companyNumber', { defaultValue: '1123331' })}
              maxLength={100}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.companyNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.companyNumber && <p className="text-red-500 text-xs mt-1">{errors.companyNumber}</p>}
            {formData.companyName && formData.companyName.trim() && (
              <p className="text-xs text-gray-500 mt-1">{t('bookings.helpers.companyNumberRequired', { defaultValue: 'Required when company name is provided' })}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('bookings.labels.companyNumberType', { defaultValue: 'Company Number Type' })}</label>
            <select
              name="companyNumberType"
              value={formData.companyNumberType}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="VAT">VAT</option>
              <option value="Registration Number">Registration Number</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('bookings.labels.companyType', { defaultValue: 'Company Type' })}</label>
            <input
              type="text"
              name="companyType"
              value={formData.companyType}
              onChange={handleChange}
              maxLength={50}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.companyType ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.companyType && <p className="text-red-500 text-xs mt-1">{errors.companyType}</p>}
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          onClick={() => setCurrentStep(5)}
          variant="outline"
        >
          {t('common.back', { defaultValue: 'Back' })}
        </Button>
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={handleSkip}
            variant="outline"
          >
            {t('common.skip', { defaultValue: 'Skip' })}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            isLoading={createGuestMutation.isPending}
            disabled={createGuestMutation.isPending}
          >
            {existingGuestId ? t('common.save', { defaultValue: 'Save' }) : t('common.next', { defaultValue: 'Next' })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GuestForm;

