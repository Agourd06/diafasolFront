/**
 * Room Days Form - Step 3
 * 
 * Add daily pricing for each room
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateBookingRoomDay } from '../../hooks/useBookingMutations';
import { useBookingRoomsByBookingId } from '../../hooks/useBookingRooms';
import { useBookingWizard } from '../../context/BookingWizardContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { CreateBookingRoomDayPayload } from '../../types';

const RoomDaysForm: React.FC = () => {
  const { t } = useTranslation();
  const { bookingId, rooms, roomIds, addRoomDays, markStepCompleted, setCurrentStep, roomDays } = useBookingWizard();
  const createRoomDayMutation = useCreateBookingRoomDay();
  
  // Fetch rooms from API when in continue mode (bookingId exists)
  const { data: apiRoomsData, isLoading: isLoadingApiRooms, refetch: refetchApiRooms } = useBookingRoomsByBookingId(
    {
      bookingId: bookingId || '',
      includeDays: false, // We only need the status, not full days data
    },
    !!bookingId // Only fetch if bookingId exists
  );
  
  // Use API rooms if available (continue mode), otherwise use wizard state rooms
  const availableRooms = apiRoomsData?.data || rooms;
  const roomsFromApi = apiRoomsData?.data || [];

  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [days, setDays] = useState<{ stayDate: string; price: number }[]>([]);

  // Get current room data - prefer API room if available (has ID and days status)
  const currentRoom = availableRooms[currentRoomIndex];
  const currentApiRoom = roomsFromApi[currentRoomIndex];

  // Check if room days already exist for current room
  const getExistingRoomDays = (roomIndex: number) => {
    // First check API room data (most reliable)
    const apiRoom = roomsFromApi[roomIndex];
    if (apiRoom?.hasRoomDays && apiRoom.days && apiRoom.days.length > 0) {
      return apiRoom.days.map(day => ({
        stayDate: day.stayDate,
        price: day.price,
      }));
    }
    
    // Fallback to wizard state
    const roomTempId = `temp-${roomIndex}`;
    const existingDays = roomDays.find(rd => rd.roomTempId === roomTempId);
    return existingDays?.days || null;
  };
  
  // Check if a room has days configured (using API data if available)
  const roomHasDays = (roomIndex: number): boolean => {
    const apiRoom = roomsFromApi[roomIndex];
    if (apiRoom) {
      return apiRoom.hasRoomDays || false;
    }
    
    // Fallback to wizard state check
    const existingDays = getExistingRoomDays(roomIndex);
    return !!(existingDays && existingDays.length > 0);
  };
  
  // Get room ID from API room or wizard state
  const getRoomId = (roomIndex: number): string | null => {
    const apiRoom = roomsFromApi[roomIndex];
    if (apiRoom?.id) {
      return apiRoom.id;
    }
    
    // Fallback to wizard state
    const room = rooms[roomIndex];
    const roomTempId = `temp-${roomIndex}`;
    return (room as any)?.id || roomIds.find(rid => rid.tempId === roomTempId)?.id || roomIds[roomIndex]?.id || null;
  };

  // Generate dates between checkin and checkout, or load existing days
  useEffect(() => {
    if (currentRoom) {
      // First check if we have existing days for this room
      const existingDays = getExistingRoomDays(currentRoomIndex);
      
      if (existingDays && existingDays.length > 0) {
        // Load existing days - handle both formats (date/amount from API, stayDate/price from form)
        setDays(existingDays.map((day: any) => ({
          stayDate: day.stayDate || day.date,
          price: typeof day.price === 'number' ? day.price : (typeof day.amount === 'string' ? parseFloat(day.amount) : parseFloat(day.amount || '0')),
        })));
      } else {
        // Generate new days based on checkin/checkout dates
        const checkin = new Date(currentRoom.checkinDate);
        const checkout = new Date(currentRoom.checkoutDate);
        const generatedDays: { stayDate: string; price: number }[] = [];

        for (let d = new Date(checkin); d < checkout; d.setDate(d.getDate() + 1)) {
          generatedDays.push({
            stayDate: d.toISOString().split('T')[0],
            price: currentRoom.amount ? currentRoom.amount / Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24)) : 0,
          });
        }

        setDays(generatedDays);
      }
    }
  }, [currentRoomIndex, currentRoom?.checkinDate, currentRoom?.checkoutDate, currentRoom?.amount, roomDays, roomsFromApi]);

  const handlePriceChange = (index: number, value: string) => {
    setDays((prev) => {
      const newDays = [...prev];
      newDays[index].price = parseFloat(value) || 0;
      return newDays;
    });
  };

  const handleSaveRoomDays = async () => {
    // Get room ID using the helper function (prioritizes API data)
    const roomId = getRoomId(currentRoomIndex);
    
    console.log('🔍 Room Days Form - Debug Info:', {
      currentRoomIndex,
      currentRoom,
      currentApiRoom,
      roomId,
      roomIds,
      apiRooms: roomsFromApi.map((r, i) => ({
        index: i,
        id: r.id,
        hasRoomDays: r.hasRoomDays,
        daysCount: r.daysCount,
      })),
      allRooms: rooms.map((r, i) => ({
        index: i,
        hasId: !!(r as any).id,
        id: (r as any).id,
      })),
      daysToSave: days,
      roomsCount: availableRooms.length,
      apiRoomsCount: roomsFromApi.length,
    });
    
    if (!roomId || roomId.trim() === '') {
      console.error('❌ No room ID available. Room:', currentRoom, 'API Room:', currentApiRoom, 'RoomIds:', roomIds);
      alert(t('bookings.errors.roomIdMissing', { defaultValue: 'Error: Cannot save room days. Room ID is missing for Room {{roomNumber}}.\n\nPlease ensure the room is saved first.', roomNumber: currentRoomIndex + 1 }));
      return;
    }
    
    // Check if room already has days (from API)
    if (currentApiRoom?.hasRoomDays) {
      const confirm = window.confirm(
        t('bookings.alerts.roomDaysAlreadyConfigured', { defaultValue: 'Room {{roomNumber}} already has {{count}} day(s) configured.\n\nDo you want to add additional days? This will create duplicate entries.', roomNumber: currentRoomIndex + 1, count: currentApiRoom.daysCount })
      );
      if (!confirm) {
        return;
      }
    }

    try {
      // Create all days for this room
      const payloads: CreateBookingRoomDayPayload[] = [];
      for (const day of days) {
        const payload: CreateBookingRoomDayPayload = {
          bookingRoomId: roomId,
          stayDate: day.stayDate,
          price: day.price,
        };
        payloads.push(payload);
        console.log('📤 Sending room day payload:', payload);
        await createRoomDayMutation.mutateAsync(payload);
      }
      
      console.log('✅ All room days payloads sent:', payloads);

      // Save to wizard state
      addRoomDays(`temp-${currentRoomIndex}`, days.map(d => ({ ...d, bookingRoomId: roomId })));

      // Refetch API rooms to update days status
      if (bookingId) {
        await refetchApiRooms();
      }

      // Move to next room that doesn't have days yet, or complete step
      const nextRoomIndex = findNextRoomWithoutDays(currentRoomIndex);
      if (nextRoomIndex !== null) {
        setCurrentRoomIndex(nextRoomIndex);
      } else {
        // All rooms have days configured
        markStepCompleted(3);
        setCurrentStep(4);
      }
    } catch (error) {
      console.error('Failed to save room days:', error);
    }
  };

  // Find the next room that doesn't have days configured yet
  const findNextRoomWithoutDays = (startIndex: number): number | null => {
    for (let i = startIndex + 1; i < availableRooms.length; i++) {
      if (!roomHasDays(i)) {
        return i;
      }
    }
    return null; // All remaining rooms have days
  };

  const handleSkip = () => {
    setCurrentStep(4); // Skip to services
  };

  if (isLoadingApiRooms) {
    return (
      <Card className="p-6">
        <p className="text-gray-500 text-center py-8">{t('bookings.messages.loadingRooms', { defaultValue: 'Loading rooms...' })}</p>
      </Card>
    );
  }

  if (availableRooms.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-gray-500 text-center py-8">
          {t('bookings.messages.noRoomsAdded', { defaultValue: 'No rooms added yet. Please go back and add rooms first.' })}
        </p>
        <div className="flex justify-center mt-4">
          <Button onClick={() => setCurrentStep(2)}>{t('bookings.messages.backToRooms', { defaultValue: 'Back to Rooms' })}</Button>
        </div>
      </Card>
    );
  }

  const isLastRoom = currentRoomIndex === availableRooms.length - 1;
  const allRoomsHaveDays = availableRooms.every((_, index) => roomHasDays(index));
  const currentRoomHasDays = roomHasDays(currentRoomIndex);

  return (
    <div className="space-y-6">
      {/* Room Navigation Pills */}
      {availableRooms.length > 1 && (
        <Card className="p-4">
          <div className="flex gap-2 flex-wrap">
            {availableRooms.map((room, index) => {
              const hasDays = roomHasDays(index);
              const isCurrent = index === currentRoomIndex;
              const apiRoom = roomsFromApi[index];
              const daysCount = apiRoom?.daysCount || 0;
              
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentRoomIndex(index)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-md'
                      : hasDays
                      ? 'bg-green-100 text-green-800 border-2 border-green-300 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
                  }`}
                  title={hasDays ? `${daysCount} ${t('bookings.messages.daysAlreadyConfigured', { defaultValue: 'day(s) configured', count: daysCount }).replace('✓ {{count}} ', '')}` : t('bookings.messages.daysAlreadyConfigured', { defaultValue: 'No days configured' })}
                >
                  {t('bookings.messages.room', { defaultValue: 'Room' })} {index + 1}
                  {hasDays && (
                    <span className="ml-2">
                      ✓ {daysCount > 0 && `(${daysCount})`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('bookings.messages.room', { defaultValue: 'Room' })} {currentRoomIndex + 1} {t('bookings.messages.of', { defaultValue: 'of' })} {availableRooms.length} - {t('bookings.messages.dailyPricing', { defaultValue: 'Daily Pricing' })}
          </h3>
          {currentRoomHasDays && currentApiRoom && (
            <p className="text-sm text-green-600 mt-1">
              {t('bookings.messages.daysAlreadyConfigured', { defaultValue: '✓ {{count}} day(s) already configured for this room', count: currentApiRoom.daysCount })}
            </p>
          )}
          {currentApiRoom?.id && (
            <p className="text-xs text-gray-500 mt-1 font-mono">
              Room ID: {currentApiRoom.id}
            </p>
          )}
          </div>
          <div className="text-sm text-gray-600">
            {currentRoom.checkinDate} → {currentRoom.checkoutDate}
          </div>
        </div>

        <div className="space-y-3">
          {days.map((day, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  {new Date(day.stayDate).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </label>
              </div>
              <div className="w-40">
                <input
                  type="number"
                  value={day.price}
                  onChange={(e) => handlePriceChange(index, e.target.value)}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={t('bookings.placeholders.price', { defaultValue: 'Price' })}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-medium">{t('bookings.messages.total', { defaultValue: 'Total' })}:</span> {days.reduce((sum, day) => sum + day.price, 0).toFixed(2)}
          </p>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          onClick={() => currentRoomIndex > 0 ? setCurrentRoomIndex(currentRoomIndex - 1) : setCurrentStep(2)}
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
            onClick={handleSaveRoomDays}
            isLoading={createRoomDayMutation.isPending}
            disabled={createRoomDayMutation.isPending}
          >
            {allRoomsHaveDays 
              ? t('common.next', { defaultValue: 'Next' })
              : findNextRoomWithoutDays(currentRoomIndex) !== null
              ? t('bookings.messages.saveAndNextRoom', { defaultValue: 'Save & Next Room' })
              : t('common.next', { defaultValue: 'Next' })
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomDaysForm;

