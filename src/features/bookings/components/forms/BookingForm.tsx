/**
 * Booking Form - Step 1
 * 
 * Main booking information form
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useCreateBooking } from '../../hooks';
import { useBookingWizard } from '../../context/BookingWizardContext';
import { getProperties } from '@/api/properties.api';
import { CURRENCIES } from '@/constants/currencies';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { BookingStatus, CreateBookingPayload } from '../../types';

const BookingForm: React.FC = () => {
  const { t } = useTranslation();
  const { setBooking, setBookingId, markStepCompleted, setCurrentStep } = useBookingWizard();
  const createBookingMutation = useCreateBooking();

  // Fetch properties for dropdown
  const { data: propertiesData } = useQuery({
    queryKey: ['properties'],
    queryFn: () => getProperties({ page: 1, limit: 100 }),
  });

  const [formData, setFormData] = useState({
    propertyId: '',
    status: 'new' as BookingStatus,
    arrivalDate: '',
    departureDate: '',
    amount: '',
    uniqueId: '',
    otaReservationCode: '',
    otaName: '',
    arrivalHour: '',
    otaCommission: '',
    currency: 'EUR', // Default to EUR
    notes: '',
    adultsCount: 2,
    childrenCount: 0,
    infantsCount: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.propertyId) newErrors.propertyId = 'Property is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.arrivalDate) newErrors.arrivalDate = 'Arrival date is required';
    if (!formData.departureDate) newErrors.departureDate = 'Departure date is required';
    if (!formData.amount) newErrors.amount = 'Amount is required';
    if (formData.amount && isNaN(parseFloat(formData.amount))) {
      newErrors.amount = 'Amount must be a valid number';
    }

    // Validate dates
    if (formData.arrivalDate && formData.departureDate) {
      const arrival = new Date(formData.arrivalDate);
      const departure = new Date(formData.departureDate);
      if (departure <= arrival) {
        newErrors.departureDate = 'Departure must be after arrival';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      // Build payload with only flat booking fields (NO nested arrays/objects except occupancy)
      // This matches the MySQL relational database design - related data is in separate tables
      const payload: CreateBookingPayload = {
        propertyId: formData.propertyId,
        status: formData.status,
        arrivalDate: formData.arrivalDate,
        departureDate: formData.departureDate,
        amount: parseFloat(formData.amount).toFixed(2), // String format: "220.00" as per API spec
        currency: formData.currency || 'EUR', // ISO 4217 code, default to EUR
      };

      // Add optional fields only if they have non-empty values
      if (formData.uniqueId?.trim()) {
        payload.uniqueId = formData.uniqueId.trim();
      }
      if (formData.otaReservationCode?.trim()) {
        payload.otaReservationCode = formData.otaReservationCode.trim();
      }
      if (formData.otaName?.trim()) {
        payload.otaName = formData.otaName.trim();
      }
      if (formData.arrivalHour?.trim()) {
        payload.arrivalHour = formData.arrivalHour.trim();
      }
      if (formData.otaCommission?.trim()) {
        payload.otaCommission = formData.otaCommission.trim();
      }
      if (formData.notes?.trim()) {
        payload.notes = formData.notes.trim();
      }

      // Occupancy is the ONLY nested object allowed - stored as flat columns in database
      // CRITICAL: Values must be NUMBERS (not strings!) - API will reject strings
      const adults = typeof formData.adultsCount === 'number' ? formData.adultsCount : parseInt(String(formData.adultsCount), 10) || 0;
      const children = typeof formData.childrenCount === 'number' ? formData.childrenCount : parseInt(String(formData.childrenCount), 10) || 0;
      const infants = typeof formData.infantsCount === 'number' ? formData.infantsCount : parseInt(String(formData.infantsCount), 10) || 0;
      
      payload.occupancy = {
        adults: adults,
        children: children,
        infants: infants,
      };

      // Debug: Log the payload to verify structure
      console.log('📤 Booking payload (Step 1):', JSON.stringify(payload, null, 2));
      console.log('📤 Occupancy values:', {
        adults: typeof payload.occupancy.adults,
        children: typeof payload.occupancy.children,
        infants: typeof payload.occupancy.infants,
      });

      const result = await createBookingMutation.mutateAsync(payload);
      
      // Save to wizard state
      setBooking(payload);
      setBookingId(result.id);
      markStepCompleted(1);
      setCurrentStep(2);
    } catch (error: any) {
      console.error('❌ Failed to create booking:', error);
      // Show error to user
      if (error.response?.data?.message) {
        const errorMessage = Array.isArray(error.response.data.message)
          ? error.response.data.message.join(', ')
          : error.response.data.message;
        alert(`Error: ${errorMessage}`);
      } else {
        alert(`Failed to create booking: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Convert number inputs to numbers
    if (type === 'number' && (name === 'adultsCount' || name === 'childrenCount' || name === 'infantsCount')) {
      const numValue = value === '' ? 0 : parseInt(value, 10);
      setFormData((prev) => ({ ...prev, [name]: numValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Property Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('bookings.form.property', { defaultValue: 'Property' })} <span className="text-red-500">*</span>
            </label>
            <select
              name="propertyId"
              value={formData.propertyId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('bookings.form.selectProperty', { defaultValue: 'Select a property' })}</option>
              {propertiesData?.data.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.title}
                </option>
              ))}
            </select>
            {errors.propertyId && <p className="text-red-500 text-xs mt-1">{errors.propertyId}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('bookings.form.status', { defaultValue: 'Status' })} <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {(['new', 'pending', 'confirmed', 'modified', 'cancelled', 'checked_in', 'checked_out'] as const).map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
            {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
          </div>

          {/* Arrival Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('bookings.form.arrivalDate', { defaultValue: 'Arrival Date' })} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="arrivalDate"
              value={formData.arrivalDate}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.arrivalDate && <p className="text-red-500 text-xs mt-1">{errors.arrivalDate}</p>}
          </div>

          {/* Departure Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('bookings.form.departureDate', { defaultValue: 'Departure Date' })} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="departureDate"
              value={formData.departureDate}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.departureDate && <p className="text-red-500 text-xs mt-1">{errors.departureDate}</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('bookings.form.amount', { defaultValue: 'Amount' })} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="220.00"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('bookings.form.currency', { defaultValue: 'Currency' })}
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.name} ({currency.code})
                </option>
              ))}
            </select>
          </div>

          {/* Unique ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('bookings.form.uniqueId', { defaultValue: 'Unique ID' })}
            </label>
            <input
              type="text"
              name="uniqueId"
              value={formData.uniqueId}
              onChange={handleChange}
              placeholder="BDC-1556013801"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* OTA Reservation Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('bookings.form.otaReservationCode', { defaultValue: 'OTA Reservation Code' })}
            </label>
            <input
              type="text"
              name="otaReservationCode"
              value={formData.otaReservationCode}
              onChange={handleChange}
              placeholder="1556013801"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* OTA Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('bookings.form.otaName', { defaultValue: 'OTA Name' })}
            </label>
            <input
              type="text"
              name="otaName"
              value={formData.otaName}
              onChange={handleChange}
              placeholder="Booking.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Arrival Hour */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('bookings.form.arrivalHour', { defaultValue: 'Arrival Hour' })}
            </label>
            <input
              type="time"
              name="arrivalHour"
              value={formData.arrivalHour}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* OTA Commission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('bookings.form.otaCommission', { defaultValue: 'OTA Commission' })}
            </label>
            <input
              type="text"
              name="otaCommission"
              value={formData.otaCommission}
              onChange={handleChange}
              placeholder="10.00"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Occupancy */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('bookings.form.occupancy', { defaultValue: 'Occupancy' })}
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Adults</label>
                <input
                  type="number"
                  name="adultsCount"
                  value={formData.adultsCount}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Children</label>
                <input
                  type="number"
                  name="childrenCount"
                  value={formData.childrenCount}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Infants</label>
                <input
                  type="number"
                  name="infantsCount"
                  value={formData.infantsCount}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('bookings.form.notes', { defaultValue: 'Notes' })}
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Additional notes..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            isLoading={createBookingMutation.isPending}
            disabled={createBookingMutation.isPending}
            className="px-8"
          >
            {t('common.next', { defaultValue: 'Next' })}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default BookingForm;

