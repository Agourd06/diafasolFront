import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@/utils/validation';
import { MIN_STAY_TYPES } from '@/utils/constants/min-stay-types';
import PropertySearchSelect from '@/components/inputs/PropertySearchSelect';
import { usePropertyById } from '@/features/properties/hooks/usePropertyById';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';
import { useCreatePropertySettings } from '../hooks/useCreatePropertySettings';
import { useUpdatePropertySettings } from '../hooks/useUpdatePropertySettings';
import { useToast } from '@/context/ToastContext';
import type { PropertySettings } from '../types';

interface PropertySettingsFormProps {
  propertySettings?: PropertySettings;
  initialPropertyId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PropertySettingsForm: React.FC<PropertySettingsFormProps> = ({
  propertySettings,
  initialPropertyId,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const isEditMode = !!propertySettings;
  const createMutation = useCreatePropertySettings();
  const updateMutation = useUpdatePropertySettings();

  const [propertyId, setPropertyId] = useState(propertySettings?.propertyId || initialPropertyId || '');
  const [allowAvailabilityAutoupdateOnConfirmation, setAllowAvailabilityAutoupdateOnConfirmation] =
    useState(propertySettings?.allowAvailabilityAutoupdateOnConfirmation || false);
  const [allowAvailabilityAutoupdateOnModification, setAllowAvailabilityAutoupdateOnModification] =
    useState(propertySettings?.allowAvailabilityAutoupdateOnModification || false);
  const [allowAvailabilityAutoupdateOnCancellation, setAllowAvailabilityAutoupdateOnCancellation] =
    useState(propertySettings?.allowAvailabilityAutoupdateOnCancellation || false);
  const [minStayType, setMinStayType] = useState(propertySettings?.minStayType || '');
  const [minPrice, setMinPrice] = useState(propertySettings?.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(propertySettings?.maxPrice?.toString() || '');
  const [stateLength, setStateLength] = useState(propertySettings?.stateLength?.toString() || '365');
  const [cutOffTime, setCutOffTime] = useState(propertySettings?.cutOffTime || '00:00:00');
  const [cutOffDays, setCutOffDays] = useState(propertySettings?.cutOffDays?.toString() || '');
  const [maxDayAdvance, setMaxDayAdvance] = useState(
    propertySettings?.maxDayAdvance?.toString() || ''
  );

  // Fetch property information for display
  const currentPropertyId = propertySettings?.propertyId || initialPropertyId || '';
  const { data: propertyData } = usePropertyById(currentPropertyId);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (propertySettings) {
      setPropertyId(propertySettings.propertyId || '');
      setAllowAvailabilityAutoupdateOnConfirmation(
        propertySettings.allowAvailabilityAutoupdateOnConfirmation || false
      );
      setAllowAvailabilityAutoupdateOnModification(
        propertySettings.allowAvailabilityAutoupdateOnModification || false
      );
      setAllowAvailabilityAutoupdateOnCancellation(
        propertySettings.allowAvailabilityAutoupdateOnCancellation || false
      );
      setMinStayType(propertySettings.minStayType || '');
      setMinPrice(propertySettings.minPrice?.toString() || '');
      setMaxPrice(propertySettings.maxPrice?.toString() || '');
      setStateLength(propertySettings.stateLength?.toString() || '365');
      setCutOffTime(propertySettings.cutOffTime || '00:00:00');
      setCutOffDays(propertySettings.cutOffDays?.toString() || '');
      setMaxDayAdvance(propertySettings.maxDayAdvance?.toString() || '');
      setValidationErrors({});
    } else if (initialPropertyId) {
      setPropertyId(initialPropertyId);
    }
  }, [propertySettings, initialPropertyId]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!isEditMode && !propertyId) {
      errors.propertyId = t('propertySettings.validation.propertyRequired');
    }

    if (minPrice && (isNaN(Number(minPrice)) || Number(minPrice) < 0)) {
      errors.minPrice = t('propertySettings.validation.minPriceInvalid');
    }

    if (maxPrice && (isNaN(Number(maxPrice)) || Number(maxPrice) < 0)) {
      errors.maxPrice = t('propertySettings.validation.maxPriceInvalid');
    }

    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      errors.maxPrice = t('propertySettings.validation.maxPriceLessThanMin');
    }

    if (stateLength && (isNaN(Number(stateLength)) || Number(stateLength) < 0)) {
      errors.stateLength = t('propertySettings.validation.stateLengthInvalid');
    }

    if (cutOffDays && (isNaN(Number(cutOffDays)) || Number(cutOffDays) < 0)) {
      errors.cutOffDays = t('propertySettings.validation.cutOffDaysInvalid');
    }

    if (maxDayAdvance && (isNaN(Number(maxDayAdvance)) || Number(maxDayAdvance) < 0)) {
      errors.maxDayAdvance = t('propertySettings.validation.maxDayAdvanceInvalid');
    }

    const timePattern = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
    if (cutOffTime && !timePattern.test(cutOffTime)) {
      errors.cutOffTime = t('propertySettings.validation.cutOffTimeInvalid');
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
      ...(allowAvailabilityAutoupdateOnConfirmation && {
        allowAvailabilityAutoupdateOnConfirmation: true,
      }),
      ...(allowAvailabilityAutoupdateOnModification && {
        allowAvailabilityAutoupdateOnModification: true,
      }),
      ...(allowAvailabilityAutoupdateOnCancellation && {
        allowAvailabilityAutoupdateOnCancellation: true,
      }),
      ...(minStayType && { minStayType: minStayType.trim() }),
      ...(minPrice && { minPrice: Number(minPrice) }),
      ...(maxPrice && { maxPrice: Number(maxPrice) }),
      ...(stateLength && { stateLength: Number(stateLength) }),
      ...(cutOffTime && {
        cutOffTime: cutOffTime.trim().length === 5
          ? cutOffTime.trim() + ':00'
          : cutOffTime.trim(),
      }),
      ...(cutOffDays && { cutOffDays: Number(cutOffDays) }),
      ...(maxDayAdvance && { maxDayAdvance: Number(maxDayAdvance) }),
    };

    if (!isEditMode) {
      formData.propertyId = propertyId;
    }

    try {
      if (isEditMode && propertySettings) {
        await updateMutation.mutateAsync({ propertyId: propertySettings.propertyId, payload: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      // Reset form
      setPropertyId(initialPropertyId || '');
      setAllowAvailabilityAutoupdateOnConfirmation(false);
      setAllowAvailabilityAutoupdateOnModification(false);
      setAllowAvailabilityAutoupdateOnCancellation(false);
      setMinStayType('');
      setMinPrice('');
      setMaxPrice('');
      setStateLength('365');
      setCutOffTime('00:00:00');
      setCutOffDays('');
      setMaxDayAdvance('');
      setValidationErrors({});
      onSuccess?.();
      if (isEditMode) {
        showSuccess(t('propertySettings.updateSuccess', { defaultValue: 'Settings updated successfully!' }));
      } else {
        showSuccess(t('propertySettings.createSuccess', { defaultValue: 'Settings created successfully!' }));
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
            {t('propertySettings.form.propertyOfSettings')}: <span className="font-bold text-brand-700">{propertyData.title}</span>
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
            label={`${t('propertySettings.form.property')} *`}
            value={propertyId}
            onChange={setPropertyId}
            error={validationErrors.propertyId}
            disabled={isLoading}
          />
        </div>
      )}

      {/* Availability Settings */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-900">{t('propertySettings.form.availabilitySettings')}</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allowAvailabilityAutoupdateOnConfirmation}
              onChange={(e) => setAllowAvailabilityAutoupdateOnConfirmation(e.target.checked)}
              disabled={isLoading}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-700">{t('propertySettings.form.allowOnConfirmation')}</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allowAvailabilityAutoupdateOnModification}
              onChange={(e) => setAllowAvailabilityAutoupdateOnModification(e.target.checked)}
              disabled={isLoading}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-700">{t('propertySettings.form.allowOnModification')}</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allowAvailabilityAutoupdateOnCancellation}
              onChange={(e) => setAllowAvailabilityAutoupdateOnCancellation(e.target.checked)}
              disabled={isLoading}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-700">{t('propertySettings.form.allowOnCancellation')}</span>
          </label>
        </div>
      </div>

      {/* Pricing Settings */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-900">{t('propertySettings.form.pricingSettings')}</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="minStayType" className="text-sm font-medium">
              {t('propertySettings.form.minStayType')}
            </Label>
            <select
              id="minStayType"
              value={minStayType}
              onChange={(e) => setMinStayType(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-300 focus:border-brand-500 focus:ring-brand-500 px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500"
            >
              <option value="">{t('propertySettings.form.selectMinStayType')}</option>
              {MIN_STAY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="minPrice" className="text-sm font-medium">
              {t('propertySettings.form.minPrice')}
            </Label>
            <Input
              type="number"
              id="minPrice"
              step="0.01"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0.00"
              error={validationErrors.minPrice}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="maxPrice" className="text-sm font-medium">
              {t('propertySettings.form.maxPrice')}
            </Label>
            <Input
              type="number"
              id="maxPrice"
              step="0.01"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="0.00"
              error={validationErrors.maxPrice}
              disabled={isLoading}
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-900">{t('propertySettings.form.advancedSettings')}</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="stateLength" className="text-sm font-medium">
              {t('propertySettings.form.stateLength')}
            </Label>
            <Input
              type="number"
              id="stateLength"
              min="0"
              value={stateLength}
              onChange={(e) => setStateLength(e.target.value)}
              placeholder="365"
              error={validationErrors.stateLength}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cutOffTime" className="text-sm font-medium">
              {t('propertySettings.form.cutOffTime')}
            </Label>
            <Input
              type="time"
              id="cutOffTime"
              value={cutOffTime ? cutOffTime.substring(0, 5) : '00:00'}
              onChange={(e) => {
                const timeValue = e.target.value;
                if (timeValue) {
                  setCutOffTime(timeValue + ':00');
                } else {
                  setCutOffTime('00:00:00');
                }
                if (validationErrors.cutOffTime) {
                  setValidationErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.cutOffTime;
                    return newErrors;
                  });
                }
              }}
              error={validationErrors.cutOffTime}
              disabled={isLoading}
              className="text-sm"
            />
            <p className="text-xs text-slate-500">{t('propertySettings.form.cutOffTimeHelp')}</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cutOffDays" className="text-sm font-medium">
              {t('propertySettings.form.cutOffDays')}
            </Label>
            <Input
              type="number"
              id="cutOffDays"
              min="0"
              value={cutOffDays}
              onChange={(e) => setCutOffDays(e.target.value)}
              placeholder="0"
              error={validationErrors.cutOffDays}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="maxDayAdvance" className="text-sm font-medium">
              {t('propertySettings.form.maxDayAdvance')}
            </Label>
            <Input
              type="number"
              id="maxDayAdvance"
              min="0"
              value={maxDayAdvance}
              onChange={(e) => setMaxDayAdvance(e.target.value)}
              placeholder="0"
              error={validationErrors.maxDayAdvance}
              disabled={isLoading}
              className="text-sm"
            />
          </div>
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

export default PropertySettingsForm;
