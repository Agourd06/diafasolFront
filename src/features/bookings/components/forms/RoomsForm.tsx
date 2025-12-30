/**
 * Rooms Form - Step 2
 * 
 * Add rooms to the booking
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useCreateBookingRoom } from '../../hooks/useBookingMutations';
import { useUpdateBookingRoom, useDeleteBookingRoom } from '../../hooks/useBookingRooms';
import { useBookingWizard } from '../../context/BookingWizardContext';
import { getRoomTypes } from '@/api/room-types.api';
import { getRatePlansByRoomType } from '@/api/rate-plans.api';
import { validateRoomForm } from '../../validation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { CreateBookingRoomPayload } from '../../types';

const RoomsForm: React.FC = () => {
  const { t } = useTranslation();
  const { bookingId, addRoom, addRoomId, updateRoom, removeRoom, markStepCompleted, setCurrentStep, rooms, roomIds, booking } = useBookingWizard();
  const createRoomMutation = useCreateBookingRoom();
  const updateRoomMutation = useUpdateBookingRoom();
  const deleteRoomMutation = useDeleteBookingRoom();

  // Initialize form state FIRST before using it in hooks
  const [formData, setFormData] = useState<Omit<CreateBookingRoomPayload, 'bookingId'>>({
    roomTypeId: '',
    ratePlanId: '',
    checkinDate: '',
    checkoutDate: '',
    adults: 2,
    children: 0,
    infants: 0,
    amount: undefined,
    otaUniqueId: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempId] = useState(() => `temp-${Date.now()}`);

  // Fetch room types for dropdowns
  const { data: roomTypesData } = useQuery({
    queryKey: ['roomTypes', booking?.propertyId],
    queryFn: () => getRoomTypes({ page: 1, limit: 100 }),
    enabled: !!booking?.propertyId,
  });

  // Fetch rate plans filtered by selected room type
  const { data: ratePlansData } = useQuery({
    queryKey: ['ratePlans', 'roomType', formData.roomTypeId],
    queryFn: () => getRatePlansByRoomType(formData.roomTypeId),
    enabled: !!formData.roomTypeId, // Only fetch when room type is selected
  });

  // Load existing rooms when component mounts or when rooms change
  useEffect(() => {
    // If we have rooms but form is empty, don't auto-fill (user might want to add new)
    // Only auto-fill if we're explicitly editing
    if (editingIndex !== null && rooms[editingIndex]) {
      const room = rooms[editingIndex];
      setFormData({
        roomTypeId: room.roomTypeId || '',
        ratePlanId: room.ratePlanId || '',
        checkinDate: room.checkinDate || '',
        checkoutDate: room.checkoutDate || '',
        adults: room.adults || 2,
        children: room.children || 0,
        infants: room.infants || 0,
        amount: room.amount,
        otaUniqueId: room.otaUniqueId ? String(room.otaUniqueId) : undefined,
      });
    }
  }, [editingIndex, rooms]);

  const validate = (): boolean => {
    const bookingContext = booking ? {
      arrivalDate: booking.arrivalDate,
      departureDate: booking.departureDate,
    } : undefined;

    const validationErrors = validateRoomForm(formData, bookingContext);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
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
        otaUniqueId: formData.otaUniqueId ? String(formData.otaUniqueId) : undefined,
      };

      if (editingIndex !== null) {
        // Update existing room - get ID from room object or roomIds mapping
        const existingRoom = rooms[editingIndex];
        const roomId = (existingRoom as any)?.id || roomIds[editingIndex]?.id;
        if (!roomId) {
          console.error('No room ID available for update');
          alert(t('bookings.errors.cannotUpdateRoom', { defaultValue: 'Error: Cannot update room. Room ID is missing.' }));
          return;
        }

        await updateRoomMutation.mutateAsync({
          id: roomId,
          payload: {
            roomTypeId: formData.roomTypeId,
            ratePlanId: formData.ratePlanId,
            checkinDate: formData.checkinDate,
            checkoutDate: formData.checkoutDate,
            adults: formData.adults,
            children: formData.children,
            infants: formData.infants,
            amount: formData.amount,
            otaUniqueId: formData.otaUniqueId ? String(formData.otaUniqueId) : undefined,
          },
        });

        // Update in wizard state - preserve id if it exists
        const updatedRoom: any = {
          ...payload,
        };
        // Preserve id if it exists on the existing room
        if (existingRoom && 'id' in existingRoom && existingRoom.id) {
          updatedRoom.id = existingRoom.id;
        }
        updateRoom(editingIndex, updatedRoom);
        setEditingIndex(null);
      } else {
        // Create new room
        const result = await createRoomMutation.mutateAsync(payload);
        
        // Add to wizard state with the ID included in the room object
        const roomWithId = {
          ...payload,
          id: result.id, // Include the ID in the room object itself
        };
        addRoom(roomWithId);
        addRoomId(tempId, result.id);
        
        console.log('✅ Room created with ID:', {
          roomId: result.id,
          tempId,
          room: roomWithId,
        });
      }

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
        otaUniqueId: undefined,
      });
    } catch (error) {
      console.error('Failed to save room:', error);
    }
  };

  const handleEditRoom = (index: number) => {
    setEditingIndex(index);
  };

  const handleDeleteRoom = async (index: number) => {
    if (!window.confirm(t('bookings.alerts.deleteRoom', { defaultValue: 'Are you sure you want to delete this room?' }))) {
      return;
    }

    const roomId = roomIds[index]?.id;
    if (roomId) {
      try {
        await deleteRoomMutation.mutateAsync(roomId);
        removeRoom(index);
      } catch (error) {
        console.error('Failed to delete room:', error);
      }
    } else {
      // If no room ID, just remove from state (not yet saved)
      removeRoom(index);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setFormData({
      roomTypeId: '',
      ratePlanId: '',
      checkinDate: '',
      checkoutDate: '',
      adults: 2,
      children: 0,
      infants: 0,
      amount: undefined,
      otaUniqueId: undefined,
    });
  };

  const handleNext = () => {
    if (rooms.length === 0) {
      alert(t('bookings.errors.addRoomRequired', { defaultValue: 'Please add at least one room' }));
      return;
    }
    markStepCompleted(2);
    setCurrentStep(3);
  };

  const handleSkip = () => {
    setCurrentStep(4); // Skip to services
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    if (type === 'number' && (name === 'adults' || name === 'children' || name === 'infants')) {
      const numValue = value === '' ? 0 : parseInt(value, 10);
      setFormData((prev) => ({ ...prev, [name]: numValue }));
    } else if (name === 'amount') {
      // Allow empty string for amount (optional field)
      setFormData((prev) => ({ ...prev, [name]: value === '' ? undefined : parseFloat(value) || undefined }));
    } else if (name === 'otaUniqueId') {
      // OTA Unique ID should be a number
      setFormData((prev) => ({ ...prev, [name]: value === '' ? undefined : parseInt(value, 10) || undefined }));
    } else {
      setFormData((prev) => {
        const newData = { ...prev, [name]: value };
        // Reset rate plan when room type changes
        if (name === 'roomTypeId') {
          newData.ratePlanId = '';
        }
        return newData;
      });
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Room Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {editingIndex !== null 
            ? t('bookings.rooms.editRoom', { defaultValue: 'Edit Room' })
            : t('bookings.rooms.addRoom', { defaultValue: 'Add Room' })
          }
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Room Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('bookings.labels.roomType', { defaultValue: 'Room Type' })} <span className="text-red-500">*</span>
            </label>
            <select
              name="roomTypeId"
              value={formData.roomTypeId}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.roomTypeId ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
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
              {t('bookings.labels.ratePlan', { defaultValue: 'Rate Plan' })} <span className="text-red-500">*</span>
            </label>
            <select
              name="ratePlanId"
              value={formData.ratePlanId}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.ratePlanId ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="">{t('bookings.rooms.selectRatePlan', { defaultValue: 'Select a rate plan' })}</option>
              {ratePlansData?.map((ratePlan) => (
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
              {t('bookings.labels.checkinDate', { defaultValue: 'Check-in Date' })} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="checkinDate"
              value={formData.checkinDate}
              onChange={handleChange}
              min={booking?.arrivalDate}
              max={booking?.departureDate}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.checkinDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.checkinDate && <p className="text-red-500 text-xs mt-1">{errors.checkinDate}</p>}
            {booking?.arrivalDate && (
              <p className="text-xs text-gray-500 mt-1">
                {t('bookings.helpers.dateRange', { defaultValue: 'Must be between {{start}} and {{end}}', start: booking.arrivalDate, end: booking.departureDate })}
              </p>
            )}
          </div>

          {/* Check-out Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('bookings.labels.checkoutDate', { defaultValue: 'Check-out Date' })} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="checkoutDate"
              value={formData.checkoutDate}
              onChange={handleChange}
              min={formData.checkinDate || booking?.arrivalDate}
              max={booking?.departureDate}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.checkoutDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.checkoutDate && <p className="text-red-500 text-xs mt-1">{errors.checkoutDate}</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('bookings.labels.amount', { defaultValue: 'Amount' })}
            </label>
            <input
              type="text"
              name="amount"
              value={formData.amount !== undefined ? formData.amount : ''}
              onChange={handleChange}
              placeholder={t('bookings.placeholders.amount', { defaultValue: '200.00' })}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.amount ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            <p className="text-xs text-gray-500 mt-1">{t('bookings.helpers.amountOptional', { defaultValue: 'Optional: Enter amount with up to 2 decimal places' })}</p>
          </div>

          {/* OTA Unique ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('bookings.labels.otaUniqueId', { defaultValue: 'OTA Unique ID' })}
            </label>
            <input
              type="number"
              name="otaUniqueId"
              value={formData.otaUniqueId !== undefined ? formData.otaUniqueId : ''}
              onChange={handleChange}
              placeholder={t('bookings.placeholders.otaUniqueId', { defaultValue: '49' })}
              min="0"
              step="1"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">{t('bookings.helpers.otaUniqueIdOptional', { defaultValue: 'Optional: Enter a numeric OTA unique identifier' })}</p>
          </div>

          {/* Occupancy */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('bookings.labels.occupancy', { defaultValue: 'Occupancy' })} <span className="text-xs text-gray-500">({t('bookings.labels.occupancyHelper', { defaultValue: 'at least one guest required' })})</span>
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">{t('bookings.labels.adults', { defaultValue: 'Adults' })}</label>
                <input
                  type="number"
                  name="adults"
                  value={formData.adults}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.adults ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">{t('bookings.labels.children', { defaultValue: 'Children' })}</label>
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
                <label className="block text-xs text-gray-600 mb-1">{t('bookings.labels.infants', { defaultValue: 'Infants' })}</label>
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
            {errors.adults && <p className="text-red-500 text-xs mt-1">{errors.adults}</p>}
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
            onClick={handleAddRoom}
            isLoading={createRoomMutation.isPending || updateRoomMutation.isPending}
            disabled={createRoomMutation.isPending || updateRoomMutation.isPending}
            variant="outline"
          >
            {editingIndex !== null 
              ? t('bookings.rooms.updateRoom', { defaultValue: 'Update Room' })
              : t('bookings.rooms.addRoom', { defaultValue: '+ Add Room' })
            }
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
            {rooms.map((room, index) => {
              const roomType = roomTypesData?.data.find(rt => rt.id === room.roomTypeId);
              const ratePlan = ratePlansData?.find(rp => rp.id === room.ratePlanId);
              
              return (
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
                        {t('bookings.messages.room', { defaultValue: 'Room' })} {index + 1}: {room.checkinDate} → {room.checkoutDate}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {roomType?.title || t('bookings.rooms.unknownRoomType', { defaultValue: 'Unknown Room Type' })} • {ratePlan?.title || t('bookings.rooms.unknownRatePlan', { defaultValue: 'Unknown Rate Plan' })}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Adults: {room.adults}, Children: {room.children}, Infants: {room.infants}
                        {room.amount && ` | Amount: ${room.amount}`}
                        {room.otaUniqueId && ` | OTA ID: ${room.otaUniqueId}`}
                      </p>
                      {/* Display Room ID for debugging */}
                      {((room as any).id || roomIds.find(rid => rid.tempId === `temp-${index}`)?.id) && (
                        <p className="text-xs text-blue-600 mt-1 font-mono">
                          Room ID: {(room as any).id || roomIds.find(rid => rid.tempId === `temp-${index}`)?.id}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        type="button"
                        onClick={() => handleEditRoom(index)}
                        variant="outline"
                        disabled={editingIndex !== null && editingIndex !== index}
                        className="px-3 py-1.5 text-xs"
                      >
                        {t('common.edit', { defaultValue: 'Edit' })}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleDeleteRoom(index)}
                        variant="outline"
                        disabled={editingIndex !== null || deleteRoomMutation.isPending}
                        className="px-3 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                      >
                        {t('common.delete', { defaultValue: 'Delete' })}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          onClick={() => setCurrentStep(1)}
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

