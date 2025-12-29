/**
 * Services Form - Step 4
 * 
 * Add additional services to the booking
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateBookingService } from '../../hooks/useBookingMutations';
import { useBookingWizard } from '../../context/BookingWizardContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { CreateBookingServicePayload } from '../../types';

const ServicesForm: React.FC = () => {
  const { t } = useTranslation();
  const { bookingId, addService, removeService, markStepCompleted, setCurrentStep, services } = useBookingWizard();
  const createServiceMutation = useCreateBookingService();

  const [formData, setFormData] = useState({
    serviceType: 'Breakfast',
    name: 'Breakfast',
    priceMode: 'Per person per night',
    persons: 2,
    nights: 1,
    pricePerUnit: 10.0,
    totalPrice: 20.0,
  });

  const handleAddService = async () => {
    if (!bookingId) {
      console.error('No booking ID available');
      return;
    }

    try {
      const payload: CreateBookingServicePayload = {
        bookingId,
        ...formData,
      };

      await createServiceMutation.mutateAsync(payload);
      
      // Add to wizard state
      addService(payload);

      // Reset form
      setFormData({
        serviceType: 'Breakfast',
        name: 'Breakfast',
        priceMode: 'Per person per night',
        persons: 2,
        nights: 1,
        pricePerUnit: 10.0,
        totalPrice: 20.0,
      });
    } catch (error) {
      console.error('Failed to add service:', error);
    }
  };

  const handleNext = () => {
    markStepCompleted(4);
    setCurrentStep(5);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: type === 'number' ? parseFloat(value) : value,
      };

      // Auto-calculate total price
      if (['persons', 'nights', 'pricePerUnit'].includes(name)) {
        newData.totalPrice = newData.persons * newData.nights * newData.pricePerUnit;
      }

      return newData;
    });
  };

  return (
    <div className="space-y-6">
      {/* Add Service Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('bookings.services.addService', { defaultValue: 'Add Service' })}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Type</label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Parking">Parking</option>
              <option value="WiFi">WiFi</option>
              <option value="Airport Transfer">Airport Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Price Mode</label>
            <input
              type="text"
              name="priceMode"
              value={formData.priceMode}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Persons</label>
            <input
              type="number"
              name="persons"
              value={formData.persons}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nights</label>
            <input
              type="number"
              name="nights"
              value={formData.nights}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Price Per Unit</label>
            <input
              type="number"
              name="pricePerUnit"
              value={formData.pricePerUnit}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Price</label>
            <input
              type="number"
              name="totalPrice"
              value={formData.totalPrice}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
              readOnly
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button
            type="button"
            onClick={handleAddService}
            isLoading={createServiceMutation.isPending}
            disabled={createServiceMutation.isPending}
            variant="secondary"
          >
            + Add Service
          </Button>
        </div>
      </Card>

      {/* Added Services List */}
      {services.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Added Services ({services.length})
          </h3>
          <div className="space-y-3">
            {services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{service.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {service.persons} × {service.nights} nights × {service.pricePerUnit} = {service.totalPrice}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => removeService(index)}
                  variant="secondary"
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          onClick={() => setCurrentStep(3)}
          variant="secondary"
        >
          {t('common.back', { defaultValue: 'Back' })}
        </Button>
        <Button
          type="button"
          onClick={handleNext}
        >
          {t('common.next', { defaultValue: 'Next' })}
        </Button>
      </div>
    </div>
  );
};

export default ServicesForm;

