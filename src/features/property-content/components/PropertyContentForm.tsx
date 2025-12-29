import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@/utils/validation';
import RichTextEditor from '@/components/ui/RichTextEditor';
import PropertySearchSelect from '@/components/inputs/PropertySearchSelect';
import { usePropertyById } from '@/features/properties/hooks/usePropertyById';
import Button from '../../../components/ui/Button';
import Label from '../../../components/ui/Label';
import { useCreatePropertyContent } from '../hooks/useCreatePropertyContent';
import { useUpdatePropertyContent } from '../hooks/useUpdatePropertyContent';
import { useToast } from '@/context/ToastContext';
import type { PropertyContent } from '../types';

interface PropertyContentFormProps {
  propertyContent?: PropertyContent;
  initialPropertyId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PropertyContentForm: React.FC<PropertyContentFormProps> = ({
  propertyContent,
  initialPropertyId,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const isEditMode = !!propertyContent;
  const createMutation = useCreatePropertyContent();
  const updateMutation = useUpdatePropertyContent();

  const [propertyId, setPropertyId] = useState(propertyContent?.propertyId || initialPropertyId || '');
  const [description, setDescription] = useState(propertyContent?.description || '');
  const [importantInformation, setImportantInformation] = useState(
    propertyContent?.importantInformation || ''
  );

  // Fetch property information for display
  const currentPropertyId = propertyContent?.propertyId || initialPropertyId || '';
  const { data: propertyData } = usePropertyById(currentPropertyId);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (propertyContent) {
      setPropertyId(propertyContent.propertyId || '');
      setDescription(propertyContent.description || '');
      setImportantInformation(propertyContent.importantInformation || '');
    } else if (initialPropertyId) {
      setPropertyId(initialPropertyId);
    }
  }, [propertyContent, initialPropertyId]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!isEditMode && !propertyId) {
      errors.propertyId = t('propertyContent.validation.propertyRequired');
    }

    if (!description.trim() && !importantInformation.trim()) {
      errors.general = t('propertyContent.validation.atLeastOneField');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const cleanDescription = description.trim().replace(/\s+$/gm, '');
    const cleanImportantInfo = importantInformation.trim().replace(/\s+$/gm, '');

    const formData: any = {
      ...(cleanDescription && { description: cleanDescription }),
      ...(cleanImportantInfo && { importantInformation: cleanImportantInfo }),
    };

    if (!isEditMode) {
      formData.propertyId = propertyId;
    }

    try {
      if (isEditMode && propertyContent) {
        await updateMutation.mutateAsync({ propertyId: propertyContent.propertyId, payload: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      // Reset form
      setPropertyId(initialPropertyId || '');
      setDescription('');
      setImportantInformation('');
      setValidationErrors({});
      onSuccess?.();
      if (isEditMode) {
        showSuccess(t('propertyContent.updateSuccess', { defaultValue: 'Content updated successfully!' }));
      } else {
        showSuccess(t('propertyContent.createSuccess', { defaultValue: 'Content created successfully!' }));
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
            {t('propertyContent.form.propertyOfContent')}: <span className="font-bold text-brand-700">{propertyData.title}</span>
          </p>
        </div>
      )}

      {validationErrors.general && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-sm text-yellow-800">
          {validationErrors.general}
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
            label={`${t('propertyContent.form.property')} *`}
            value={propertyId}
            onChange={setPropertyId}
            error={validationErrors.propertyId}
            disabled={isLoading}
          />
        </div>
      )}

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-sm font-medium">
            {t('propertyContent.form.description')}
          </Label>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder={t('propertyContent.form.descriptionPlaceholder')}
            rows={6}
          />
          <p className="text-xs text-slate-500">{t('propertyContent.form.descriptionHelp')}</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="importantInformation" className="text-sm font-medium">
            {t('propertyContent.form.importantInfo')}
          </Label>
          <RichTextEditor
            value={importantInformation}
            onChange={setImportantInformation}
            placeholder={t('propertyContent.form.importantInfoPlaceholder')}
            rows={6}
          />
          <p className="text-xs text-slate-500">{t('propertyContent.form.importantInfoHelp')}</p>
        </div>
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

export default PropertyContentForm;
