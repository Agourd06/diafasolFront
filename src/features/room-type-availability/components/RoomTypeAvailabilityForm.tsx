/**
 * Room Type Availability Form Component
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@/utils/validation';
import PropertySearchSelect from '@/components/inputs/PropertySearchSelect';
import RoomTypeSearchSelect from '@/components/inputs/RoomTypeSearchSelect';
import { useRoomTypeById } from '@/features/room-types';
import { usePropertyById } from '@/features/properties/hooks/usePropertyById';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';
import { useCreateRoomTypeAvailability, useUpdateRoomTypeAvailability } from '../hooks';
import { useToast } from '@/context/ToastContext';
import type { RoomTypeAvailability } from '../types';

interface RoomTypeAvailabilityFormProps {
  availability?: RoomTypeAvailability;
  initialRoomTypeId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const RoomTypeAvailabilityForm: React.FC<RoomTypeAvailabilityFormProps> = ({
  availability,
  initialRoomTypeId,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const isEditMode = !!availability;
  const createMutation = useCreateRoomTypeAvailability();
  const updateMutation = useUpdateRoomTypeAvailability();

  const [propertyId, setPropertyId] = useState(availability?.propertyId || '');
  const [roomTypeId, setRoomTypeId] = useState(availability?.roomTypeId || initialRoomTypeId || '');
  const [date, setDate] = useState(availability?.date || '');
  const [availabilityCount, setAvailabilityCount] = useState(availability?.availability?.toString() || '');

  // Fetch room type to get propertyId when initialRoomTypeId is provided
  const { data: initialRoomType } = useRoomTypeById(initialRoomTypeId || '', !!initialRoomTypeId && !isEditMode);
  
  // Fetch room type information for display
  const currentRoomTypeId = availability?.roomTypeId || initialRoomTypeId || '';
  const { data: roomTypeData } = useRoomTypeById(currentRoomTypeId, !!currentRoomTypeId);
  
  // Fetch property information for display
  const currentPropertyId = availability?.propertyId || initialRoomType?.propertyId || '';
  const { data: propertyData } = usePropertyById(currentPropertyId);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (availability) {
      setPropertyId(availability.propertyId);
      setRoomTypeId(availability.roomTypeId);
      setDate(availability.date);
      setAvailabilityCount(availability.availability?.toString());
      setValidationErrors({});
    } else if (initialRoomTypeId && initialRoomType) {
      setRoomTypeId(initialRoomTypeId);
      setPropertyId(initialRoomType.propertyId);
    }
  }, [availability, initialRoomTypeId, initialRoomType]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!isEditMode) {
      if (!propertyId) errors.propertyId = t('roomTypeAvailability.validation.propertyRequired');
      if (!roomTypeId) errors.roomTypeId = t('roomTypeAvailability.validation.roomTypeRequired');
      if (!date) errors.date = t('roomTypeAvailability.validation.dateRequired');
    }

    if (!availabilityCount && availabilityCount !== '0') {
      errors.availability = t('roomTypeAvailability.validation.availabilityRequired');
    } else if (isNaN(Number(availabilityCount)) || Number(availabilityCount) < 0) {
      errors.availability = t('roomTypeAvailability.validation.availabilityInvalid');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const formData: any = {
      availability: Number(availabilityCount),
    };

    if (!isEditMode) {
      formData.propertyId = propertyId;
      formData.roomTypeId = roomTypeId;
      formData.date = date;
    }

    try {
      if (isEditMode && availability) {
        await updateMutation.mutateAsync({ id: availability.id, payload: formData });
        showSuccess(t('roomTypeAvailability.updateSuccess', { defaultValue: 'Availability updated successfully!' }));
      } else {
        await createMutation.mutateAsync(formData);
        showSuccess(t('roomTypeAvailability.createSuccess', { defaultValue: 'Availability created successfully!' }));
      }
      // Reset form
      setPropertyId(initialRoomType?.propertyId || '');
      setRoomTypeId(initialRoomTypeId || '');
      setDate('');
      setAvailabilityCount('');
      setValidationErrors({});
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || t('common.error', { defaultValue: 'An error occurred' });
      showError(errorMessage);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Property and Room Type Information Banners */}
      {(propertyData || roomTypeData) && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {propertyData && (
            <div className="bg-brand-50 border border-brand-200 rounded-lg p-3">
              <p className="text-sm font-semibold text-brand-900">
                {t('roomTypeAvailability.form.propertyOfAvailability')}: <span className="font-bold text-brand-700">{propertyData.title}</span>
              </p>
            </div>
          )}
          {roomTypeData && (
            <div className="bg-brand-50 border border-brand-200 rounded-lg p-3">
              <p className="text-sm font-semibold text-brand-900">
                {t('roomTypeAvailability.form.roomTypeOfAvailability')}: <span className="font-bold text-brand-700">{roomTypeData.title}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          <p className="font-medium">{t('common.error')}</p>
          <p className="text-xs mt-1">{getErrorMessage(error)}</p>
        </div>
      )}

      {/* Property and Room Type Selectors (only if not preselected) */}
      {!isEditMode && !initialRoomTypeId && (
        <>
          <div className="space-y-1.5">
            <PropertySearchSelect
              label={`${t('roomTypeAvailability.form.property')} *`}
              value={propertyId}
              onChange={(value) => {
                setPropertyId(value);
                if (value !== propertyId) {
                  setRoomTypeId('');
                }
              }}
              error={validationErrors.propertyId}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <RoomTypeSearchSelect
              label={`${t('roomTypeAvailability.form.roomType')} *`}
              value={roomTypeId}
              onChange={setRoomTypeId}
              propertyId={propertyId}
              error={validationErrors.roomTypeId}
              disabled={isLoading || !propertyId}
            />
          </div>
        </>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="date" className="text-sm font-medium">
          {t('roomTypeAvailability.form.date')} <span className="text-red-500">*</span>
        </Label>
        <Input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={validationErrors.date}
          disabled={isLoading}
          className="text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="availability" className="text-sm font-medium">
          {t('roomTypeAvailability.form.availability')} <span className="text-red-500">*</span>
        </Label>
        <Input
          type="number"
          id="availability"
          value={availabilityCount}
          onChange={(e) => setAvailabilityCount(e.target.value)}
          min="0"
          placeholder="5"
          error={validationErrors.availability}
          disabled={isLoading}
          className="text-sm"
        />
        <p className="text-xs text-slate-500">{t('roomTypeAvailability.form.availabilityHelp')}</p>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={isLoading}
          isLoading={isLoading}
          className="flex-1"
        >
          {isEditMode ? t('common.update') : t('common.create')}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
        )}
      </div>
    </form>
  );
};

export default RoomTypeAvailabilityForm;
