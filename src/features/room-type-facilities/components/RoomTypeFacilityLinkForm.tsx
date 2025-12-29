/**
 * Room Type Facility Link Form Component
 * 
 * Form for linking facilities to room types (many-to-many).
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@/utils/validation';
import RoomTypeSearchSelect from '@/components/inputs/RoomTypeSearchSelect';
import { useRoomTypeById } from '@/features/room-types/hooks/useRoomTypeById';
import { useFacilities } from '@/features/facilities/hooks/useFacilities';
import Button from '../../../components/ui/Button';
import Label from '../../../components/ui/Label';
import { useCreateRoomTypeFacilityLink } from '../hooks';
import type { CreateRoomTypeFacilityLinkPayload } from '../types';

interface RoomTypeFacilityLinkFormProps {
  initialRoomTypeId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const RoomTypeFacilityLinkForm: React.FC<RoomTypeFacilityLinkFormProps> = ({
  initialRoomTypeId,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const createMutation = useCreateRoomTypeFacilityLink();

  const [roomTypeId, setRoomTypeId] = useState(initialRoomTypeId || '');
  const [facilityId, setFacilityId] = useState('');

  // Fetch room type information for display
  const { data: roomTypeData } = useRoomTypeById(initialRoomTypeId || '', !!initialRoomTypeId);

  const { data: facilitiesData } = useFacilities({ limit: 100 });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const facilityOptions = useMemo(() => {
    return facilitiesData?.data.map((facility) => ({
      value: facility.id,
      label: facility.name,
    })) || [];
  }, [facilitiesData]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!roomTypeId) {
      errors.roomTypeId = t('roomTypeFacilities.validation.roomTypeRequired');
    }

    if (!facilityId) {
      errors.facilityId = t('roomTypeFacilities.validation.facilityRequired');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const formData: CreateRoomTypeFacilityLinkPayload = {
      roomTypeId,
      facilityId,
    };

    try {
      await createMutation.mutateAsync(formData);
      // Reset form
      setRoomTypeId(initialRoomTypeId || '');
      setFacilityId('');
      setValidationErrors({});
      onSuccess?.();
    } catch (error) {
      // Error is handled by mutation
    }
  };

  const isLoading = createMutation.isPending;
  const error = createMutation.error;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Room Type Information Banner */}
      {roomTypeData && (
        <div className="bg-brand-50 border border-brand-200 rounded-lg p-3 mb-2">
          <p className="text-sm font-semibold text-brand-900">
            {t('roomTypeFacilities.form.roomTypeOfFacility')}: <span className="font-bold text-brand-700">{roomTypeData.title}</span>
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          <p className="font-medium">{t('common.error')}</p>
          <p className="text-xs mt-1">{getErrorMessage(error)}</p>
        </div>
      )}

      {/* Room Type Selector (only if not preselected) */}
      {!initialRoomTypeId && (
        <div className="space-y-1.5">
          <RoomTypeSearchSelect
            label={`${t('roomTypeFacilities.form.roomType')} *`}
            value={roomTypeId}
            onChange={setRoomTypeId}
            error={validationErrors.roomTypeId}
            disabled={isLoading}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="facilityId" className="text-sm font-medium">
          {t('roomTypeFacilities.form.facility')} <span className="text-red-500">*</span>
        </Label>
        <select
          id="facilityId"
          value={facilityId}
          onChange={(e) => setFacilityId(e.target.value)}
          disabled={isLoading}
          className={`w-full rounded-lg border text-sm px-3 py-2 ${
            validationErrors.facilityId
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500'
          } focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500`}
        >
          <option value="">{t('roomTypeFacilities.form.selectFacility')}</option>
          {facilityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {validationErrors.facilityId && (
          <p className="text-xs text-red-600">{validationErrors.facilityId}</p>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={isLoading}
          isLoading={isLoading}
          className="flex-1"
        >
          {t('common.create')}
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

export default RoomTypeFacilityLinkForm;
