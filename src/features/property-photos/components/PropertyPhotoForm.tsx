import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage, isValidUrl } from '@/utils/validation';
import { PHOTO_KINDS } from '@/utils/constants/photo-kinds';
import PropertySearchSelect from '@/components/inputs/PropertySearchSelect';
import { usePropertyById } from '@/features/properties/hooks/usePropertyById';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';
import { useCreatePropertyPhoto } from '../hooks/useCreatePropertyPhoto';
import { useUpdatePropertyPhoto } from '../hooks/useUpdatePropertyPhoto';
import type { PropertyPhoto } from '../types';

interface PropertyPhotoFormProps {
  propertyPhoto?: PropertyPhoto;
  initialPropertyId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PropertyPhotoForm: React.FC<PropertyPhotoFormProps> = ({
  propertyPhoto,
  initialPropertyId,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const isEditMode = !!propertyPhoto;
  const createMutation = useCreatePropertyPhoto();
  const updateMutation = useUpdatePropertyPhoto();

  const [propertyId, setPropertyId] = useState(propertyPhoto?.propertyId || initialPropertyId || '');
  const [url, setUrl] = useState(propertyPhoto?.url || '');
  const [position, setPosition] = useState(propertyPhoto?.position?.toString() || '');
  const [author, setAuthor] = useState(propertyPhoto?.author || '');
  const [kind, setKind] = useState(propertyPhoto?.kind || '');
  const [description, setDescription] = useState(propertyPhoto?.description || '');

  // Fetch property information for display
  const currentPropertyId = propertyPhoto?.propertyId || initialPropertyId || '';
  const { data: propertyData } = usePropertyById(currentPropertyId);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const kindOptions = useMemo(() => {
    return PHOTO_KINDS.map((k) => ({
      value: k.value,
      label: k.label,
    }));
  }, []);

  useEffect(() => {
    if (propertyPhoto) {
      setPropertyId(propertyPhoto.propertyId || '');
      setUrl(propertyPhoto.url || '');
      setPosition(propertyPhoto.position?.toString() || '');
      setAuthor(propertyPhoto.author || '');
      setKind(propertyPhoto.kind || '');
      setDescription(propertyPhoto.description || '');
    } else if (initialPropertyId) {
      setPropertyId(initialPropertyId);
    }
  }, [propertyPhoto, initialPropertyId]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!isEditMode && !propertyId) {
      errors.propertyId = t('propertyPhotos.validation.propertyRequired');
    }

    if (!url.trim()) {
      errors.url = t('propertyPhotos.validation.urlRequired');
    } else if (!isValidUrl(url.trim())) {
      errors.url = t('propertyPhotos.validation.urlInvalid');
    }

    if (position && (isNaN(Number(position)) || Number(position) < 0)) {
      errors.position = t('propertyPhotos.validation.positionInvalid');
    }

    if (author && author.length > 255) {
      errors.author = t('propertyPhotos.validation.authorTooLong');
    }

    if (kind && kind.length > 50) {
      errors.kind = t('propertyPhotos.validation.kindTooLong');
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
      url: url.trim(),
      ...(position && { position: Number(position) }),
      ...(author.trim() && { author: author.trim() }),
      ...(kind && { kind: kind.trim() }),
      ...(description.trim() && { description: description.trim() }),
    };

    if (!isEditMode) {
      formData.propertyId = propertyId;
    }

    try {
      if (isEditMode && propertyPhoto) {
        await updateMutation.mutateAsync({ id: propertyPhoto.id, payload: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      // Reset form
      setPropertyId(initialPropertyId || '');
      setUrl('');
      setPosition('');
      setAuthor('');
      setKind('');
      setDescription('');
      setValidationErrors({});
      onSuccess?.();
      if (isEditMode) {
        showSuccess(t('propertyPhotos.updateSuccess', { defaultValue: 'Photo updated successfully!' }));
      } else {
        showSuccess(t('propertyPhotos.createSuccess', { defaultValue: 'Photo created successfully!' }));
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
            {t('propertyPhotos.form.propertyOfPhoto')}: <span className="font-bold text-brand-700">{propertyData.title}</span>
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          <p className="font-medium">{t('common.error')}</p>
          <p className="text-xs mt-1">{getErrorMessage(error)}</p>
        </div>
      )}

      {/* Property Selector (only if not preselected) */}
      {!isEditMode && !initialPropertyId && (
        <div className="space-y-1.5">
          <PropertySearchSelect
            label={`${t('propertyPhotos.form.property')} *`}
            value={propertyId}
            onChange={setPropertyId}
            error={validationErrors.propertyId}
            disabled={isLoading}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="url" className="text-sm font-medium">
          {t('propertyPhotos.form.url')} <span className="text-red-500">*</span>
        </Label>
        <Input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/photo.jpg"
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
            {t('propertyPhotos.form.position')}
          </Label>
          <Input
            type="number"
            id="position"
            min="0"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="1"
            error={validationErrors.position}
            disabled={isLoading}
            className="text-sm"
          />
          <p className="text-xs text-slate-500">{t('propertyPhotos.form.positionHelp')}</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="kind" className="text-sm font-medium">
            {t('propertyPhotos.form.kind')}
          </Label>
          <select
            id="kind"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-slate-300 focus:border-brand-500 focus:ring-brand-500 px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500"
          >
            <option value="">{t('propertyPhotos.form.selectKind')}</option>
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
          {t('propertyPhotos.form.author')}
        </Label>
        <Input
          type="text"
          id="author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder={t('propertyPhotos.form.authorPlaceholder')}
          maxLength={255}
          error={validationErrors.author}
          disabled={isLoading}
          className="text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-sm font-medium">
          {t('propertyPhotos.form.description')}
        </Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          disabled={isLoading}
          className="w-full rounded-lg border border-slate-300 focus:border-brand-500 focus:ring-brand-500 px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500"
          placeholder={t('propertyPhotos.form.descriptionPlaceholder')}
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

export default PropertyPhotoForm;
