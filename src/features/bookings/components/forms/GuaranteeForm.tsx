/**
 * Guarantee Form - Step 5
 * 
 * Add payment guarantee/card information
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateBookingGuarantee } from '../../hooks/useBookingMutations';
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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.cardHolderName && !formData.cardHolderName.trim()) {
      newErrors.cardHolderName = 'Card holder name is required';
    }

    if (formData.maskedCardNumber && !/^\d{6}\*+\d{4}$/.test(formData.maskedCardNumber)) {
      newErrors.maskedCardNumber = 'Invalid format (e.g., 411111******1111)';
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
        cardType: formData.cardType || undefined,
        cardHolderName: formData.cardHolderName || undefined,
        maskedCardNumber: formData.maskedCardNumber || undefined,
        expirationDate: formData.expirationDate || undefined,
      };

      await createGuaranteeMutation.mutateAsync(payload);
      
      // Save to wizard state
      setGuarantee(payload);
      markStepCompleted(5);
      setCurrentStep(6);
    } catch (error) {
      console.error('Failed to save guarantee:', error);
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
            ⚠️ <strong>Security Note:</strong> CVV is never stored for PCI compliance. Only enter masked card numbers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Type</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Holder Name</label>
            <input
              type="text"
              name="cardHolderName"
              value={formData.cardHolderName}
              onChange={handleChange}
              placeholder="Channex User"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.cardHolderName && <p className="text-red-500 text-xs mt-1">{errors.cardHolderName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Masked Card Number</label>
            <input
              type="text"
              name="maskedCardNumber"
              value={formData.maskedCardNumber}
              onChange={handleChange}
              placeholder="411111******1111"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
            />
            {errors.maskedCardNumber && <p className="text-red-500 text-xs mt-1">{errors.maskedCardNumber}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiration Date</label>
            <input
              type="text"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={handleChange}
              placeholder="10/2020"
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

