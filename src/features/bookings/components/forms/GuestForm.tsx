/**
 * Guest Form - Step 6
 * 
 * Add customer/guest information
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateBookingGuest } from '../../hooks/useBookingMutations';
import { useBookingWizard } from '../../context/BookingWizardContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const GuestForm: React.FC = () => {
  const { t } = useTranslation();
  const { bookingId, setGuest, markStepCompleted, setCurrentStep } = useBookingWizard();
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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

      await createGuestMutation.mutateAsync(payload);
      
      // Save to wizard state
      setGuest(payload);
      markStepCompleted(6);
      setCurrentStep(7);
    } catch (error) {
      console.error('Failed to save guest:', error);
    }
  };

  const handleSkip = () => {
    markStepCompleted(6);
    setCurrentStep(7);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="User"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Channex"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@channex.io"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="1234567890"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
            <input
              type="text"
              name="language"
              value={formData.language}
              onChange={handleChange}
              placeholder="en"
              maxLength={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="NL"
              maxLength={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Address Information */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="JW Lucasweg 35"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Haarlem"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ZIP/Postal Code</label>
            <input
              type="text"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              placeholder="2031 BE"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Company Information */}
          <div className="md:col-span-2 pt-4 border-t border-gray-200">
            <h4 className="text-md font-semibold text-gray-800 mb-4">Company Information (Optional)</h4>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Company Name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Number</label>
            <input
              type="text"
              name="companyNumber"
              value={formData.companyNumber}
              onChange={handleChange}
              placeholder="1123331"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Number Type</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Type</label>
            <input
              type="text"
              name="companyType"
              value={formData.companyType}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          onClick={() => setCurrentStep(5)}
          variant="secondary"
        >
          {t('common.back', { defaultValue: 'Back' })}
        </Button>
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={handleSkip}
            variant="secondary"
          >
            {t('common.skip', { defaultValue: 'Skip' })}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            isLoading={createGuestMutation.isPending}
            disabled={createGuestMutation.isPending}
          >
            {t('common.next', { defaultValue: 'Next' })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GuestForm;

