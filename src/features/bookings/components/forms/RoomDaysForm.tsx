/**
 * Room Days Form - Step 3
 * 
 * Add daily pricing for each room
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateBookingRoomDay } from '../../hooks/useBookingMutations';
import { useBookingWizard } from '../../context/BookingWizardContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { CreateBookingRoomDayPayload } from '../../types';

const RoomDaysForm: React.FC = () => {
  const { t } = useTranslation();
  const { rooms, roomIds, addRoomDays, markStepCompleted, setCurrentStep, roomDays } = useBookingWizard();
  const createRoomDayMutation = useCreateBookingRoomDay();

  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [days, setDays] = useState<{ stayDate: string; price: number }[]>([]);

  // Generate dates between checkin and checkout
  useEffect(() => {
    if (rooms[currentRoomIndex]) {
      const room = rooms[currentRoomIndex];
      const checkin = new Date(room.checkinDate);
      const checkout = new Date(room.checkoutDate);
      const generatedDays: { stayDate: string; price: number }[] = [];

      for (let d = new Date(checkin); d < checkout; d.setDate(d.getDate() + 1)) {
        generatedDays.push({
          stayDate: d.toISOString().split('T')[0],
          price: room.amount ? room.amount / Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24)) : 0,
        });
      }

      setDays(generatedDays);
    }
  }, [currentRoomIndex, rooms]);

  const handlePriceChange = (index: number, value: string) => {
    setDays((prev) => {
      const newDays = [...prev];
      newDays[index].price = parseFloat(value) || 0;
      return newDays;
    });
  };

  const handleSaveRoomDays = async () => {
    const roomId = roomIds[currentRoomIndex]?.id;
    if (!roomId) {
      console.error('No room ID available');
      return;
    }

    try {
      // Create all days for this room
      for (const day of days) {
        const payload: CreateBookingRoomDayPayload = {
          bookingRoomId: roomId,
          stayDate: day.stayDate,
          price: day.price,
        };
        await createRoomDayMutation.mutateAsync(payload);
      }

      // Save to wizard state
      addRoomDays(`temp-${currentRoomIndex}`, days.map(d => ({ ...d, bookingRoomId: roomId })));

      // Move to next room or complete step
      if (currentRoomIndex < rooms.length - 1) {
        setCurrentRoomIndex(currentRoomIndex + 1);
      } else {
        markStepCompleted(3);
        setCurrentStep(4);
      }
    } catch (error) {
      console.error('Failed to save room days:', error);
    }
  };

  const handleSkip = () => {
    setCurrentStep(4); // Skip to services
  };

  if (rooms.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-gray-500 text-center py-8">
          No rooms added yet. Please go back and add rooms first.
        </p>
        <div className="flex justify-center mt-4">
          <Button onClick={() => setCurrentStep(2)}>Back to Rooms</Button>
        </div>
      </Card>
    );
  }

  const currentRoom = rooms[currentRoomIndex];
  const isLastRoom = currentRoomIndex === rooms.length - 1;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Room {currentRoomIndex + 1} of {rooms.length} - Daily Pricing
          </h3>
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
                  placeholder="Price"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Total:</span> {days.reduce((sum, day) => sum + day.price, 0).toFixed(2)}
          </p>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          onClick={() => currentRoomIndex > 0 ? setCurrentRoomIndex(currentRoomIndex - 1) : setCurrentStep(2)}
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
            onClick={handleSaveRoomDays}
            isLoading={createRoomDayMutation.isPending}
            disabled={createRoomDayMutation.isPending}
          >
            {isLastRoom ? t('common.next', { defaultValue: 'Next' }) : 'Next Room'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomDaysForm;

