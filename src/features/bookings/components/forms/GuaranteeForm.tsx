/**
 * Guarantee Form - Step 5
 * 
 * Add payment guarantee/card information
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateBookingGuarantee } from '../../hooks/useBookingMutations';
import { updateBookingGuarantee } from '../../api/booking-guarantees.api';
import { useBookingWizard } from '../../context/BookingWizardContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const GuaranteeForm: React.FC = () => {
  const { t } = useTranslation();
  const { bookingId, setGuarantee, markStepCompleted, setCurrentStep, guarantee } = useBookingWizard();
  const createGuaranteeMutation = useCreateBookingGuarantee();

  const [formData, setFormData] = useState({
    cardType: 'visa',
    cardHolderName: '',
    maskedCardNumber: '',
    expirationDate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingGuaranteeId, setExistingGuaranteeId] = useState<string | null>(null);

  // Load existing guarantee data when component mounts or guarantee changes
  useEffect(() => {
    if (guarantee) {
      // Check if guarantee has a valid UUID ID (not a placeholder like 'guarantee-1')
      const guaranteeId = (guarantee as any).id;
      // Only accept valid UUIDs, not placeholder IDs
      const isValidUUID = guaranteeId && 
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(guaranteeId);
      
      if (isValidUUID) {
        setExistingGuaranteeId(guaranteeId);
        console.log('✅ Found existing guarantee ID:', guaranteeId);
      } else {
        // Invalid or placeholder ID - treat as new guarantee
        setExistingGuaranteeId(null);
        if (guaranteeId) {
          console.warn('⚠️ Invalid guarantee ID (placeholder?):', guaranteeId, '- will create new guarantee');
        }
      }
      
      // Load form data from existing guarantee
      setFormData({
        cardType: guarantee.cardType || 'visa',
        cardHolderName: guarantee.cardHolderName || '',
        maskedCardNumber: guarantee.maskedCardNumber || '',
        expirationDate: guarantee.expirationDate || '',
      });
    } else {
      // Reset form if no guarantee
      setFormData({
        cardType: 'visa',
        cardHolderName: '',
        maskedCardNumber: '',
        expirationDate: '',
      });
      setExistingGuaranteeId(null);
    }
  }, [guarantee]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.cardHolderName && !formData.cardHolderName.trim()) {
      newErrors.cardHolderName = t('bookings.errors.cardHolderNameRequired', { defaultValue: 'Card holder name is required' });
    }

    if (formData.maskedCardNumber && !/^\d{6}\*+\d{4}$/.test(formData.maskedCardNumber)) {
      newErrors.maskedCardNumber = t('bookings.errors.maskedCardNumberInvalid', { defaultValue: 'Invalid format (e.g., 411111******1111)' });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!bookingId) {
      console.error('❌ No booking ID available');
      alert(t('bookings.errors.noBookingId', { defaultValue: 'Error: No booking ID found. Please go back to Step 1 and create a booking first.' }));
      return;
    }

    // Validate booking ID format (should be a UUID)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookingId)) {
      console.error('❌ Invalid booking ID format:', bookingId);
      alert(t('bookings.errors.invalidBookingId', { defaultValue: 'Error: Invalid booking ID format: {{id}}. Please go back to Step 1 and create a booking first.', id: bookingId }));
      return;
    }

    if (!validate()) {
      return;
    }

    try {
      const payload = {
        bookingId,
        cardType: formData.cardType || undefined,
        cardHolderName: formData.cardHolderName || undefined,
        maskedCardNumber: formData.maskedCardNumber || undefined,
        expirationDate: formData.expirationDate || undefined,
      };

      // Check if guarantee already exists - update instead of create
      // Only update if we have a valid UUID (not a placeholder)
      const isValidGuaranteeId = existingGuaranteeId && 
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(existingGuaranteeId);
      
      let finalGuaranteeId = existingGuaranteeId;
      
      if (isValidGuaranteeId) {
        console.log('📤 Updating existing booking guarantee:', existingGuaranteeId, payload);
        await updateBookingGuarantee(existingGuaranteeId, {
          cardType: payload.cardType,
          cardHolderName: payload.cardHolderName,
          maskedCardNumber: payload.maskedCardNumber,
          expirationDate: payload.expirationDate,
        });
        console.log('✅ Booking guarantee updated successfully');
      } else {
        console.log('📤 Creating new booking guarantee with payload:', {
          ...payload,
          bookingId: bookingId,
          bookingIdType: typeof bookingId,
          bookingIdLength: bookingId.length,
        });
        const result = await createGuaranteeMutation.mutateAsync(payload);
        // Store the ID for future updates
        finalGuaranteeId = result.id;
        setExistingGuaranteeId(result.id);
        console.log('✅ Booking guarantee created successfully:', result.id);
      }
      
      // Save to wizard state (include ID)
      setGuarantee({
        ...payload,
        id: finalGuaranteeId,
      });
      markStepCompleted(5);
      setCurrentStep(6);
    } catch (error: any) {
      console.error('❌ Failed to save guarantee:', error);
      if (error.response?.data) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      // Show user-friendly error message
      let errorMessage = t('bookings.errors.saveGuaranteeFailed', { defaultValue: 'Failed to save guarantee. ', message: '' });
      if (error.response?.data?.message) {
        const msg = error.response.data.message;
        errorMessage += Array.isArray(msg) ? msg.join(', ') : msg;
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      // Check if it's a foreign key constraint error
      if (error.response?.data?.message?.includes('foreign key constraint') || 
          error.response?.data?.message?.includes('Cannot add or update a child row')) {
        errorMessage += `\n\nThe booking with ID "${bookingId}" may not exist in the database. Please verify the booking was created successfully in Step 1.`;
      }
      
      alert(errorMessage);
    }
  };

  const handleSkip = () => {
    markStepCompleted(5);
    setCurrentStep(6);
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
          {t('bookings.guarantee.title', { defaultValue: 'Payment Guarantee' })}
        </h3>

        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            {t('bookings.helpers.securityNote', { defaultValue: '⚠️ Security Note: CVV is never stored for PCI compliance. Only enter masked card numbers.' })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('bookings.labels.cardType', { defaultValue: 'Card Type' })}</label>
            <select
              name="cardType"
              value={formData.cardType}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
              <option value="amex">American Express</option>
              <option value="discover">Discover</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('bookings.labels.cardHolderName', { defaultValue: 'Card Holder Name' })}</label>
            <input
              type="text"
              name="cardHolderName"
              value={formData.cardHolderName}
              onChange={handleChange}
              placeholder={t('bookings.placeholders.cardHolderName', { defaultValue: 'Channex User' })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.cardHolderName && <p className="text-red-500 text-xs mt-1">{errors.cardHolderName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('bookings.labels.maskedCardNumber', { defaultValue: 'Masked Card Number' })}</label>
            <input
              type="text"
              name="maskedCardNumber"
              value={formData.maskedCardNumber}
              onChange={handleChange}
              placeholder={t('bookings.placeholders.maskedCardNumber', { defaultValue: '411111******1111' })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
            />
            {errors.maskedCardNumber && <p className="text-red-500 text-xs mt-1">{errors.maskedCardNumber}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('bookings.labels.expirationDate', { defaultValue: 'Expiration Date' })}</label>
            <input
              type="text"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={handleChange}
              placeholder={t('bookings.placeholders.expirationDate', { defaultValue: '10/2020' })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          onClick={() => setCurrentStep(4)}
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
            isLoading={createGuaranteeMutation.isPending}
            disabled={createGuaranteeMutation.isPending}
          >
            {t('common.next', { defaultValue: 'Next' })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GuaranteeForm;

