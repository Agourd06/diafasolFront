/**
 * Guest Form - Step 6
 * 
 * Add customer/guest information (follows RoomsForm pattern)
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useCreateBookingGuest } from '../../hooks/useBookingMutations';
import { useUpdateBookingGuest, useDeleteBookingGuest } from '../../hooks/useBookingGuests';
import { getBookingGuestsByBookingId } from '../../api/booking-guests.api';
import { useBookingWizard } from '../../context/BookingWizardContext';
import { validateGuestForm } from '../../validation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { CreateBookingGuestPayload } from '../../types';

const GuestForm: React.FC = () => {
  const { t } = useTranslation();
  const { 
    bookingId, 
    addGuest, 
    updateGuest, 
    removeGuest, 
    markStepCompleted, 
    setCurrentStep, 
    guests,
    booking 
  } = useBookingWizard();
  const createGuestMutation = useCreateBookingGuest();
  const updateGuestMutation = useUpdateBookingGuest();
  const deleteGuestMutation = useDeleteBookingGuest();

  // Fetch existing guests from API when in continue mode
  const { data: apiGuestsData = [] } = useQuery({
    queryKey: ['bookingGuests', bookingId],
    queryFn: () => getBookingGuestsByBookingId(bookingId!),
    enabled: !!bookingId,
  });

  // Use API guests if available (continue mode), otherwise use wizard state guests
  const displayedGuests = apiGuestsData.length > 0 ? apiGuestsData : guests;

  // Initialize form state
  const [formData, setFormData] = useState<Omit<CreateBookingGuestPayload, 'bookingId'>>({
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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Load guest data when editing
  useEffect(() => {
    if (editingIndex !== null && displayedGuests[editingIndex]) {
      const guest = displayedGuests[editingIndex];
      setFormData({
        firstName: guest.firstName || '',
        lastName: guest.lastName || '',
        email: guest.email || '',
        phone: guest.phone || '',
        language: guest.language || 'en',
        country: guest.country || '',
        city: guest.city || '',
        address: guest.address || '',
        zip: guest.zip || '',
        companyName: guest.companyName || '',
        companyNumber: guest.companyNumber || '',
        companyNumberType: guest.companyNumberType || 'VAT',
        companyType: guest.companyType || 'Registration Number',
      });
    }
  }, [editingIndex, displayedGuests]);

  const validate = (): boolean => {
    const validationErrors = validateGuestForm(formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleAddGuest = async () => {
    if (!bookingId) {
      console.error('No booking ID available');
      return;
    }

    if (!validate()) {
      return;
    }

    try {
      const payload: CreateBookingGuestPayload = {
        bookingId,
        ...formData,
      };

      if (editingIndex !== null) {
        // Update existing guest
        const existingGuest = displayedGuests[editingIndex];
        const guestId = (existingGuest as any)?.id;
        
        if (!guestId) {
          console.error('No guest ID available for update');
          alert(t('bookings.errors.cannotUpdateGuest', { defaultValue: 'Error: Cannot update guest. Guest ID is missing.' }));
          return;
        }

        await updateGuestMutation.mutateAsync({
          id: guestId,
          payload: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            language: formData.language,
            country: formData.country,
            city: formData.city,
            address: formData.address,
            zip: formData.zip,
            companyName: formData.companyName,
            companyNumber: formData.companyNumber,
            companyNumberType: formData.companyNumberType,
            companyType: formData.companyType,
          },
        });

        // Update in wizard state
        const updatedGuest: any = {
          ...payload,
        };
        if (existingGuest && 'id' in existingGuest && existingGuest.id) {
          updatedGuest.id = existingGuest.id;
        }
        updateGuest(editingIndex, updatedGuest);
        setEditingIndex(null);
      } else {
        // Create new guest
        const result = await createGuestMutation.mutateAsync(payload);
        
        // Add to wizard state with the ID
        const guestWithId = {
          ...payload,
          id: result.id,
        };
        addGuest(guestWithId);
      }

      // Reset form
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
    } catch (error) {
      console.error('Failed to save guest:', error);
    }
  };

  const handleEditGuest = (index: number) => {
    setEditingIndex(index);
  };

  const handleDeleteGuest = async (index: number) => {
    if (!window.confirm(t('bookings.alerts.deleteGuest', { defaultValue: 'Are you sure you want to delete this guest?' }))) {
      return;
    }

    const guest = displayedGuests[index];
    const guestId = (guest as any)?.id;
    
    if (guestId) {
      try {
        await deleteGuestMutation.mutateAsync(guestId);
        removeGuest(index);
      } catch (error) {
        console.error('Failed to delete guest:', error);
      }
    } else {
      // If no guest ID, just remove from state (not yet saved)
      removeGuest(index);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
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
  };

  const handleNext = () => {
    if (displayedGuests.length === 0) {
      alert(t('bookings.errors.atLeastOneGuest', { defaultValue: 'Please add at least one guest before proceeding.' }));
      return;
    }
    markStepCompleted(6);
    setCurrentStep(7);
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
      {/* Add/Edit Guest Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {editingIndex !== null 
            ? t('bookings.guest.editGuest', { defaultValue: 'Edit Guest' })
            : t('bookings.guest.addGuest', { defaultValue: 'Add Guest' })
          }
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

        <div className="flex justify-end gap-3 mt-6">
          {editingIndex !== null && (
            <Button
              type="button"
              onClick={handleCancelEdit}
              variant="outline"
            >
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </Button>
          )}
          <Button
            type="button"
            onClick={handleAddGuest}
            isLoading={createGuestMutation.isPending || updateGuestMutation.isPending}
            disabled={createGuestMutation.isPending || updateGuestMutation.isPending}
            variant="outline"
          >
            {editingIndex !== null 
              ? t('bookings.guest.updateGuest', { defaultValue: 'Update Guest' })
              : t('bookings.guest.addGuest', { defaultValue: '+ Add Guest' })
            }
          </Button>
        </div>
      </Card>

      {/* Added Guests List */}
      {displayedGuests.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('bookings.guest.addedGuests', { defaultValue: 'Added Guests' })} ({displayedGuests.length})
          </h3>
          <div className="space-y-3">
            {displayedGuests.map((guest, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border-2 ${
                  editingIndex === index 
                    ? 'bg-blue-50 border-blue-300' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {t('bookings.messages.guest', { defaultValue: 'Guest' })} {index + 1}: {guest.firstName || ''} {guest.lastName || ''}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {guest.email && `Email: ${guest.email}`}
                      {guest.phone && ` • Phone: ${guest.phone}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {guest.address && `${guest.address}`}
                      {guest.city && `, ${guest.city}`}
                      {guest.zip && ` ${guest.zip}`}
                      {guest.country && `, ${guest.country}`}
                    </p>
                    {guest.companyName && (
                      <p className="text-xs text-gray-500 mt-1">
                        {t('bookings.labels.companyName', { defaultValue: 'Company' })}: {guest.companyName}
                        {guest.companyNumber && ` (${guest.companyNumberType || ''}: ${guest.companyNumber})`}
                      </p>
                    )}
                    {/* Display Guest ID for debugging */}
                    {((guest as any).id) && (
                      <p className="text-xs text-blue-600 mt-1 font-mono">
                        Guest ID: {(guest as any).id}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      type="button"
                      onClick={() => handleEditGuest(index)}
                      variant="outline"
                      disabled={editingIndex !== null && editingIndex !== index}
                      className="px-3 py-1.5 text-xs"
                    >
                      {t('common.edit', { defaultValue: 'Edit' })}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleDeleteGuest(index)}
                      variant="outline"
                      disabled={editingIndex !== null || deleteGuestMutation.isPending}
                      className="px-3 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                    >
                      {t('common.delete', { defaultValue: 'Delete' })}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Navigation Buttons */}
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
            onClick={handleNext}
            disabled={displayedGuests.length === 0}
          >
            {t('common.next', { defaultValue: 'Next' })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GuestForm;
