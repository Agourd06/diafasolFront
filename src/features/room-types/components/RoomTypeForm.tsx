/**
 * Room Type Form Component
 * 
 * Handles creation and editing of room types with comprehensive validation.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@/utils/validation';
import PropertySearchSelect from '@/components/inputs/PropertySearchSelect';
import { usePropertyById } from '@/features/properties/hooks/usePropertyById';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';
import { ROOM_KINDS } from '@/utils/constants/room-kinds';
import { useCreateRoomType } from '../hooks/useCreateRoomType';
import { useUpdateRoomType } from '../hooks/useUpdateRoomType';
import { useToast } from '@/context/ToastContext';
import type { RoomType } from '../types';

interface RoomTypeFormProps {
  roomType?: RoomType;
  initialPropertyId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const RoomTypeForm: React.FC<RoomTypeFormProps> = ({
  roomType,
  initialPropertyId,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const isEditMode = !!roomType;
  const createMutation = useCreateRoomType();
  const updateMutation = useUpdateRoomType();

  // Form fields
  const [propertyId, setPropertyId] = useState(roomType?.propertyId || initialPropertyId || '');
  
  // Fetch property information for display
  const currentPropertyId = roomType?.propertyId || initialPropertyId || '';
  const { data: propertyData } = usePropertyById(currentPropertyId);
  const [title, setTitle] = useState(roomType?.title || '');
  const [countOfRooms, setCountOfRooms] = useState(roomType?.countOfRooms?.toString() || '');
  const [occAdults, setOccAdults] = useState(roomType?.occAdults?.toString() || '');
  const [occChildren, setOccChildren] = useState(roomType?.occChildren?.toString() || '');
  const [occInfants, setOccInfants] = useState(roomType?.occInfants?.toString() || '');
  const [defaultOccupancy, setDefaultOccupancy] = useState(roomType?.defaultOccupancy?.toString() || '');
  const [roomKind, setRoomKind] = useState(roomType?.roomKind || '');
  const [capacity, setCapacity] = useState(roomType?.capacity?.toString() || '');

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Update form when roomType prop changes
  useEffect(() => {
    if (roomType) {
      setPropertyId(roomType.propertyId || '');
      setTitle(roomType.title || '');
      setCountOfRooms(roomType.countOfRooms?.toString() || '');
      setOccAdults(roomType.occAdults?.toString() || '');
      setOccChildren(roomType.occChildren?.toString() || '');
      setOccInfants(roomType.occInfants?.toString() || '');
      setDefaultOccupancy(roomType.defaultOccupancy?.toString() || '');
      setRoomKind(roomType.roomKind || '');
      setCapacity(roomType.capacity?.toString() || '');
      setValidationErrors({});
    } else if (initialPropertyId) {
      setPropertyId(initialPropertyId);
    }
  }, [roomType, initialPropertyId]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!isEditMode && !propertyId) {
      errors.propertyId = t('roomTypes.validation.propertyRequired');
    }

    if (!title.trim()) {
      errors.title = t('roomTypes.validation.titleRequired');
    } else if (title.trim().length < 1) {
      errors.title = t('roomTypes.validation.titleMinLength');
    }

    if (!countOfRooms) {
      errors.countOfRooms = t('roomTypes.validation.countRequired');
    } else if (isNaN(Number(countOfRooms)) || Number(countOfRooms) < 1) {
      errors.countOfRooms = t('roomTypes.validation.countInvalid');
    }

    if (!occAdults && occAdults !== '0') {
      errors.occAdults = t('roomTypes.validation.occAdultsRequired');
    } else if (isNaN(Number(occAdults)) || Number(occAdults) < 0) {
      errors.occAdults = t('roomTypes.validation.occAdultsInvalid');
    }

    if (!occChildren && occChildren !== '0') {
      errors.occChildren = t('roomTypes.validation.occChildrenRequired');
    } else if (isNaN(Number(occChildren)) || Number(occChildren) < 0) {
      errors.occChildren = t('roomTypes.validation.occChildrenInvalid');
    }

    if (!occInfants && occInfants !== '0') {
      errors.occInfants = t('roomTypes.validation.occInfantsRequired');
    } else if (isNaN(Number(occInfants)) || Number(occInfants) < 0) {
      errors.occInfants = t('roomTypes.validation.occInfantsInvalid');
    }

    if (!defaultOccupancy) {
      errors.defaultOccupancy = t('roomTypes.validation.defaultOccupancyRequired');
    } else if (isNaN(Number(defaultOccupancy)) || Number(defaultOccupancy) < 1) {
      errors.defaultOccupancy = t('roomTypes.validation.defaultOccupancyInvalid');
    }

    if (capacity && (isNaN(Number(capacity)) || Number(capacity) < 1)) {
      errors.capacity = t('roomTypes.validation.capacityInvalid');
    }

    if (roomKind && roomKind.length > 50) {
      errors.roomKind = t('roomTypes.validation.roomKindMaxLength');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData: any = {
      title: title.trim(),
      countOfRooms: Number(countOfRooms),
      occAdults: Number(occAdults),
      occChildren: Number(occChildren),
      occInfants: Number(occInfants),
      defaultOccupancy: Number(defaultOccupancy),
      ...(roomKind && roomKind.trim() && { roomKind: roomKind.trim() }),
      ...(capacity && { capacity: Number(capacity) }),
    };

    // Only include propertyId for create
    if (!isEditMode) {
      formData.propertyId = propertyId;
    }

    try {
      if (isEditMode && roomType) {
        await updateMutation.mutateAsync({ id: roomType.id, payload: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      // Reset form
      setPropertyId(initialPropertyId || '');
      setTitle('');
      setCountOfRooms('');
      setOccAdults('');
      setOccChildren('');
      setOccInfants('');
      setDefaultOccupancy('');
      setRoomKind('');
      setCapacity('');
      setValidationErrors({});
      onSuccess?.();
      if (isEditMode) {
        showSuccess(t('roomTypes.updateSuccess', { defaultValue: 'Room type updated successfully!' }));
      } else {
        showSuccess(t('roomTypes.createSuccess', { defaultValue: 'Room type created successfully!' }));
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || t('common.error', { defaultValue: 'An error occurred' });
      showError(errorMessage);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Property Information Banner */}
      {propertyData && (
        <div className="bg-brand-50 border border-brand-200 rounded-lg p-3 mb-2">
          <p className="text-sm font-semibold text-brand-900">
            {t('roomTypes.form.propertyOfRoomType')}: <span className="font-bold text-brand-700">{propertyData.title}</span>
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          <p className="font-medium">{t('common.error')}</p>
          <p className="text-xs mt-1">{getErrorMessage(error)}</p>
        </div>
      )}

      {/* Property Selector (only for create, and only if not preselected) */}
      {!isEditMode && !initialPropertyId && (
        <div className="space-y-1.5">
          <PropertySearchSelect
            label={`${t('roomTypes.form.selectProperty')} *`}
            value={propertyId}
            onChange={setPropertyId}
            error={validationErrors.propertyId}
            disabled={isLoading}
          />
        </div>
      )}

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-sm font-medium">
          {t('roomTypes.form.title')} <span className="text-red-500">*</span>
        </Label>
        <Input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('roomTypes.form.titlePlaceholder')}
          error={validationErrors.title}
          disabled={isLoading}
          className="text-sm"
        />
      </div>

      {/* Count of Rooms */}
      <div className="space-y-1.5">
        <Label htmlFor="countOfRooms" className="text-sm font-medium">
          {t('roomTypes.form.countOfRooms')} <span className="text-red-500">*</span>
        </Label>
        <Input
          type="number"
          id="countOfRooms"
          value={countOfRooms}
          onChange={(e) => setCountOfRooms(e.target.value)}
          min="1"
          placeholder="10"
          error={validationErrors.countOfRooms}
          disabled={isLoading}
          className="text-sm"
        />
      </div>

      {/* Occupancy Information */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-900">{t('roomTypes.form.occupancyInformation')}</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="occAdults" className="text-sm font-medium">
              {t('roomTypes.form.occAdults')} <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              id="occAdults"
              value={occAdults}
              onChange={(e) => setOccAdults(e.target.value)}
              min="0"
              placeholder="2"
              error={validationErrors.occAdults}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="occChildren" className="text-sm font-medium">
              {t('roomTypes.form.occChildren')} <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              id="occChildren"
              value={occChildren}
              onChange={(e) => setOccChildren(e.target.value)}
              min="0"
              placeholder="1"
              error={validationErrors.occChildren}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="occInfants" className="text-sm font-medium">
              {t('roomTypes.form.occInfants')} <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              id="occInfants"
              value={occInfants}
              onChange={(e) => setOccInfants(e.target.value)}
              min="0"
              placeholder="1"
              error={validationErrors.occInfants}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="defaultOccupancy" className="text-sm font-medium">
              {t('roomTypes.form.defaultOccupancy')} <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              id="defaultOccupancy"
              value={defaultOccupancy}
              onChange={(e) => setDefaultOccupancy(e.target.value)}
              min="1"
              placeholder="2"
              error={validationErrors.defaultOccupancy}
              disabled={isLoading}
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-900">{t('roomTypes.form.additionalInformation')}</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="roomKind" className="text-sm font-medium">
              {t('roomTypes.form.roomKind')}
            </Label>
            <select
              id="roomKind"
              value={roomKind}
              onChange={(e) => setRoomKind(e.target.value)}
              disabled={isLoading}
              className={`w-full rounded-lg border text-sm px-3 py-2 ${
                validationErrors.roomKind
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500'
              } focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500`}
            >
              <option value="">{t('roomTypes.form.selectRoomKind')}</option>
              {ROOM_KINDS.map((kind) => (
                <option key={kind.value} value={kind.value}>
                  {kind.label}
                </option>
              ))}
            </select>
            {validationErrors.roomKind && (
              <p className="text-xs text-red-600">{validationErrors.roomKind}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="capacity" className="text-sm font-medium">
              {t('roomTypes.form.capacity')}
            </Label>
            <Input
              type="number"
              id="capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              min="1"
              placeholder="4"
              error={validationErrors.capacity}
              disabled={isLoading}
              className="text-sm"
            />
            <p className="text-xs text-slate-500">{t('roomTypes.form.capacityHelp')}</p>
          </div>
        </div>
      </div>

      {/* Backend Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
          <p className="font-medium">{t('common.error')}</p>
          <p className="text-xs mt-1">{getErrorMessage(error)}</p>
        </div>
      )}

      {/* Submit Button */}
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

export default RoomTypeForm;
