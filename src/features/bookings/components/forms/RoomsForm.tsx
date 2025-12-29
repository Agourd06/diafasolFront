/**
 * Rooms Form - Step 2
 * 
 * Add rooms to the booking
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useCreateBookingRoom } from '../../hooks';
import { useBookingWizard } from '../../context/BookingWizardContext';
import { getRoomTypes } from '@/api/room-types.api';
import { getRatePlans } from '@/api/rate-plans.api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { CreateBookingRoomPayload } from '../../types';

const RoomsForm: React.FC = () => {
  const { t } = useTranslation();
  const { bookingId, addRoom, addRoomId, markStepCompleted, setCurrentStep, rooms, booking } = useBookingWizard();
  const createRoomMutation = useCreateBookingRoom();

  // Fetch room types and rate plans for dropdowns
  const { data: roomTypesData } = useQuery({
    queryKey: ['roomTypes', booking?.propertyId],
    queryFn: () => getRoomTypes({ page: 1, limit: 100 }),
    enabled: !!booking?.propertyId,
  });

  const { data: ratePlansData } = useQuery({
    queryKey: ['ratePlans', booking?.propertyId],
    queryFn: () => getRatePlans({ page: 1, limit: 100 }),
    enabled: !!booking?.propertyId,
  });

  const [formData, setFormData] = useState<Omit<CreateBookingRoomPayload, 'bookingId'>>({
    roomTypeId: '',
    ratePlanId: '',
    checkinDate: '',
    checkoutDate: '',
    adults: 2,
    children: 0,
    infants: 0,
    amount: undefined,
    otaUniqueId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tempId] = useState(() => `temp-${Date.now()}`);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.roomTypeId) newErrors.roomTypeId = 'Room type is required';
    if (!formData.ratePlanId) newErrors.ratePlanId = 'Rate plan is required';
    if (!formData.checkinDate) newErrors.checkinDate = 'Check-in date is required';
    if (!formData.checkoutDate) newErrors.checkoutDate = 'Check-out date is required';

    // Validate dates
    if (formData.checkinDate && formData.checkoutDate) {
      const checkin = new Date(formData.checkinDate);
      const checkout = new Date(formData.checkoutDate);
      if (checkout <= checkin) {
        newErrors.checkoutDate = 'Check-out must be after check-in';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddRoom = async () => {
    if (!bookingId) {
      console.error('No booking ID available');
      return;
    }

    if (!validate()) {
      return;
    }

    try {
      const payload: CreateBookingRoomPayload = {
        bookingId,
        ...formData,
        otaUniqueId: formData.otaUniqueId || undefined,
      };

      const result = await createRoomMutation.mutateAsync(payload);
      
      // Add to wizard state
      addRoom(payload);
      addRoomId(tempId, result.id);

      // Reset form
      setFormData({
        roomTypeId: '',
        ratePlanId: '',
        checkinDate: '',
        checkoutDate: '',
        adults: 2,
        children: 0,
        infants: 0,
        amount: undefined,
        otaUniqueId: '',
      });
    } catch (error) {
      console.error('Failed to add room:', error);
    }
  };

  const handleNext = () => {
    if (rooms.length === 0) {
      alert('Please add at least one room');
      return;
    }
    markStepCompleted(2);
    setCurrentStep(3);
  };

  const handleSkip = () => {
    setCurrentStep(4); // Skip to services
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Room Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('bookings.rooms.addRoom', { defaultValue: 'Add Room' })}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Room Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Room Type <span className="text-red-500">*</span>
            </label>
            <select
              name="roomTypeId"
              value={formData.roomTypeId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('bookings.rooms.selectRoomType', { defaultValue: 'Select a room type' })}</option>
              {roomTypesData?.data.map((roomType) => (
                <option key={roomType.id} value={roomType.id}>
                  {roomType.title}
                </option>
              ))}
            </select>
            {errors.roomTypeId && <p className="text-red-500 text-xs mt-1">{errors.roomTypeId}</p>}
          </div>

          {/* Rate Plan Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Rate Plan <span className="text-red-500">*</span>
            </label>
            <select
              name="ratePlanId"
              value={formData.ratePlanId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('bookings.rooms.selectRatePlan', { defaultValue: 'Select a rate plan' })}</option>
              {ratePlansData?.data.map((ratePlan) => (
                <option key={ratePlan.id} value={ratePlan.id}>
                  {ratePlan.title}
                </option>
              ))}
            </select>
            {errors.ratePlanId && <p className="text-red-500 text-xs mt-1">{errors.ratePlanId}</p>}
          </div>

          {/* Check-in Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Check-in Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="checkinDate"
              value={formData.checkinDate}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.checkinDate && <p className="text-red-500 text-xs mt-1">{errors.checkinDate}</p>}
          </div>

          {/* Check-out Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Check-out Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="checkoutDate"
              value={formData.checkoutDate}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.checkoutDate && <p className="text-red-500 text-xs mt-1">{errors.checkoutDate}</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Amount
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount || ''}
              onChange={handleChange}
              placeholder="200.0"
              step="0.01"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* OTA Unique ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              OTA Unique ID
            </label>
            <input
              type="text"
              name="otaUniqueId"
              value={formData.otaUniqueId}
              onChange={handleChange}
              placeholder="49"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Occupancy */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Occupancy
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Adults</label>
                <input
                  type="number"
                  name="adults"
                  value={formData.adults}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Children</label>
                <input
                  type="number"
                  name="children"
                  value={formData.children}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Infants</label>
                <input
                  type="number"
                  name="infants"
                  value={formData.infants}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button
            type="button"
            onClick={handleAddRoom}
            isLoading={createRoomMutation.isPending}
            disabled={createRoomMutation.isPending}
            variant="secondary"
          >
            {t('bookings.rooms.addRoom', { defaultValue: '+ Add Room' })}
          </Button>
        </div>
      </Card>

      {/* Added Rooms List */}
      {rooms.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('bookings.rooms.addedRooms', { defaultValue: 'Added Rooms' })} ({rooms.length})
          </h3>
          <div className="space-y-3">
            {rooms.map((room, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Room {index + 1}:</span> {room.checkinDate} → {room.checkoutDate}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Adults: {room.adults}, Children: {room.children}, Infants: {room.infants}
                  {room.amount && ` | Amount: ${room.amount}`}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          onClick={() => setCurrentStep(1)}
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
            onClick={handleNext}
            disabled={rooms.length === 0}
          >
            {t('common.next', { defaultValue: 'Next' })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomsForm;

