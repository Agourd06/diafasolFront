/**
 * Room Type Photo Form Component
 * 
 * Form for creating/editing room type photos.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage, isValidUrl } from '@/utils/validation';
import { PHOTO_KINDS } from '@/utils/constants/photo-kinds';
import PropertySearchSelect from '@/components/inputs/PropertySearchSelect';
import RoomTypeSearchSelect from '@/components/inputs/RoomTypeSearchSelect';
import { useRoomTypeById } from '@/features/room-types';
import { usePropertyById } from '@/features/properties/hooks/usePropertyById';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';
import { useCreateRoomTypePhoto, useUpdateRoomTypePhoto } from '../hooks';
import type { RoomTypePhoto } from '../types';

interface RoomTypePhotoFormProps {
  photo?: RoomTypePhoto;
  initialRoomTypeId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const RoomTypePhotoForm: React.FC<RoomTypePhotoFormProps> = ({
  photo,
  initialRoomTypeId,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const isEditMode = !!photo;
  const createMutation = useCreateRoomTypePhoto();
  const updateMutation = useUpdateRoomTypePhoto();

  const [propertyId, setPropertyId] = useState(photo?.propertyId || '');
  const [roomTypeId, setRoomTypeId] = useState(photo?.roomTypeId || initialRoomTypeId || '');
  const [url, setUrl] = useState(photo?.url || '');
  const [position, setPosition] = useState(photo?.position?.toString() || '');
  const [author, setAuthor] = useState(photo?.author || '');
  const [kind, setKind] = useState(photo?.kind || '');
  const [description, setDescription] = useState(photo?.description || '');

  // Fetch room type to get propertyId when initialRoomTypeId is provided
  const { data: initialRoomType } = useRoomTypeById(initialRoomTypeId || '', !!initialRoomTypeId && !isEditMode);
  
  // Fetch room type information for display
  const currentRoomTypeId = photo?.roomTypeId || initialRoomTypeId || '';
  const { data: roomTypeData } = useRoomTypeById(currentRoomTypeId, !!currentRoomTypeId);
  
  // Fetch property information for display
  const currentPropertyId = photo?.propertyId || initialRoomType?.propertyId || '';
  const { data: propertyData } = usePropertyById(currentPropertyId);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const kindOptions = useMemo(() => {
    return PHOTO_KINDS.map((k) => ({
      value: k.value,
      label: k.label,
    }));
  }, []);

  useEffect(() => {
    if (photo) {
      setPropertyId(photo.propertyId);
      setRoomTypeId(photo.roomTypeId);
      setUrl(photo.url);
      setPosition(photo.position?.toString() || '');
      setAuthor(photo.author || '');
      setKind(photo.kind || '');
      setDescription(photo.description || '');
      setValidationErrors({});
    } else if (initialRoomTypeId && initialRoomType) {
      setRoomTypeId(initialRoomTypeId);
      setPropertyId(initialRoomType.propertyId);
    }
  }, [photo, initialRoomTypeId, initialRoomType]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!isEditMode) {
      if (!propertyId) errors.propertyId = t('roomTypePhotos.validation.propertyRequired');
      if (!roomTypeId) errors.roomTypeId = t('roomTypePhotos.validation.roomTypeRequired');
    }

    if (!url.trim()) {
      errors.url = t('roomTypePhotos.validation.urlRequired');
    } else if (!isValidUrl(url.trim())) {
      errors.url = t('roomTypePhotos.validation.urlInvalid');
    }

    if (position && (isNaN(Number(position)) || Number(position) < 0)) {
      errors.position = t('roomTypePhotos.validation.positionInvalid');
    }

    if (author && author.length > 255) {
      errors.author = t('roomTypePhotos.validation.authorMaxLength');
    }

    if (kind && kind.length > 50) {
      errors.kind = t('roomTypePhotos.validation.kindMaxLength');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const formData: any = {
      url: url.trim(),
      ...(position && { position: Number(position) }),
      ...(author && author.trim() && { author: author.trim() }),
      ...(kind && kind.trim() && { kind: kind.trim() }),
      ...(description && description.trim() && { description: description.trim() }),
    };

    if (!isEditMode) {
      formData.propertyId = propertyId;
      formData.roomTypeId = roomTypeId;
    }

    try {
      if (isEditMode && photo) {
        await updateMutation.mutateAsync({ id: photo.id, payload: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      // Reset form
      setPropertyId(initialRoomType?.propertyId || '');
      setRoomTypeId(initialRoomTypeId || '');
      setUrl('');
      setPosition('');
      setAuthor('');
      setKind('');
      setDescription('');
      setValidationErrors({});
      onSuccess?.();
    } catch (error) {
      // Error is handled by mutation
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
                {t('roomTypePhotos.form.propertyOfPhoto')}: <span className="font-bold text-brand-700">{propertyData.title}</span>
              </p>
            </div>
          )}
          {roomTypeData && (
            <div className="bg-brand-50 border border-brand-200 rounded-lg p-3">
              <p className="text-sm font-semibold text-brand-900">
                {t('roomTypePhotos.form.roomTypeOfPhoto')}: <span className="font-bold text-brand-700">{roomTypeData.title}</span>
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <PropertySearchSelect
              label={`${t('roomTypePhotos.form.property')} *`}
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
              label={`${t('roomTypePhotos.form.roomType')} *`}
              value={roomTypeId}
              onChange={setRoomTypeId}
              propertyId={propertyId}
              error={validationErrors.roomTypeId}
              disabled={isLoading || !propertyId}
            />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="url" className="text-sm font-medium">
          {t('roomTypePhotos.form.url')} <span className="text-red-500">*</span>
        </Label>
        <Input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/room-photo.jpg"
          error={validationErrors.url}
          disabled={isLoading}
          className="text-sm"
        />
        {url && isValidUrl(url) && (
          <div className="mt-2">
            <img
              src={url}
              alt="Preview"
              className="max-w-full h-32 object-cover rounded-lg border border-slate-200"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="position" className="text-sm font-medium">
            {t('roomTypePhotos.form.position')}
          </Label>
          <Input
            type="number"
            id="position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            min="0"
            placeholder="1"
            error={validationErrors.position}
            disabled={isLoading}
            className="text-sm"
          />
          <p className="text-xs text-slate-500">{t('roomTypePhotos.form.positionHelp')}</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="kind" className="text-sm font-medium">
            {t('roomTypePhotos.form.kind')}
          </Label>
          <select
            id="kind"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-slate-300 focus:border-brand-500 focus:ring-brand-500 px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500"
          >
            <option value="">{t('roomTypePhotos.form.selectKind')}</option>
            {kindOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {validationErrors.kind && (
            <p className="text-xs text-red-600">{validationErrors.kind}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="author" className="text-sm font-medium">
          {t('roomTypePhotos.form.author')}
        </Label>
        <Input
          type="text"
          id="author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          maxLength={255}
          placeholder="John Doe"
          error={validationErrors.author}
          disabled={isLoading}
          className="text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-sm font-medium">
          {t('roomTypePhotos.form.description')}
        </Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          disabled={isLoading}
          className="w-full rounded-lg border border-slate-300 focus:border-brand-500 focus:ring-brand-500 px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500"
          placeholder={t('roomTypePhotos.form.descriptionPlaceholder')}
        />
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

export default RoomTypePhotoForm;
