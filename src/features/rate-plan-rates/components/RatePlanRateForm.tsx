import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@/utils/validation';
import RatePlanSearchSelect from '@/components/inputs/RatePlanSearchSelect';
import PropertySearchSelect from '@/components/inputs/PropertySearchSelect';
import { useRatePlan } from '@/features/rate-plans/hooks/useRatePlan';
import { usePropertyById } from '@/features/properties/hooks/usePropertyById';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';
import { useCreateRatePlanRate } from '../hooks/useCreateRatePlanRate';
import { useUpdateRatePlanRate } from '../hooks/useUpdateRatePlanRate';
import { useToast } from '@/context/ToastContext';
import type { RatePlanRate } from '../types';

interface RatePlanRateFormProps {
  ratePlanRate?: RatePlanRate;
  initialRatePlanId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const RatePlanRateForm: React.FC<RatePlanRateFormProps> = ({
  ratePlanRate,
  initialRatePlanId,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const isEditMode = !!ratePlanRate;
  const createMutation = useCreateRatePlanRate();
  const updateMutation = useUpdateRatePlanRate();

  const [propertyId, setPropertyId] = useState(ratePlanRate?.propertyId || '');
  const [ratePlanId, setRatePlanId] = useState(ratePlanRate?.ratePlanId || initialRatePlanId || '');
  const [date, setDate] = useState(ratePlanRate?.date || '');
  const [rate, setRate] = useState(ratePlanRate?.rate?.toString() || '0');

  // Fetch rate plan and property information for display
  const currentRatePlanId = ratePlanRate?.ratePlanId || initialRatePlanId || '';
  const currentPropertyId = ratePlanRate?.propertyId || '';
  const { data: ratePlanData } = useRatePlan(currentRatePlanId);
  const { data: propertyData } = usePropertyById(currentPropertyId);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (ratePlanRate) {
      setPropertyId(ratePlanRate.propertyId || '');
      setRatePlanId(ratePlanRate.ratePlanId || '');
      setDate(ratePlanRate.date || '');
      setRate(ratePlanRate.rate?.toString() || '0');
    } else if (initialRatePlanId) {
      setRatePlanId(initialRatePlanId);
    }
  }, [ratePlanRate, initialRatePlanId]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!propertyId.trim()) {
      errors.propertyId = t('ratePlanRates.validation.propertyRequired');
    }

    if (!ratePlanId.trim()) {
      errors.ratePlanId = t('ratePlanRates.validation.ratePlanRequired');
    }

    if (!date.trim()) {
      errors.date = t('ratePlanRates.validation.dateRequired');
    }

    const rateNum = parseFloat(rate);
    if (isNaN(rateNum) || rateNum < 0) {
      errors.rate = t('ratePlanRates.validation.rateInvalid');
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
      propertyId: propertyId.trim(),
      ratePlanId: ratePlanId.trim(),
      date: date.trim(),
      rate: parseFloat(rate),
    };

    try {
      if (isEditMode && ratePlanRate) {
        await updateMutation.mutateAsync({ id: ratePlanRate.id, payload: formData });
        showSuccess(t('ratePlanRates.updateSuccess', { defaultValue: 'Rate updated successfully!' }));
      } else {
        await createMutation.mutateAsync(formData);
        showSuccess(t('ratePlanRates.createSuccess', { defaultValue: 'Rate created successfully!' }));
      }
      // Reset form
      setPropertyId('');
      setRatePlanId(initialRatePlanId || '');
      setDate('');
      setRate('0');
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
      {/* Property and Rate Plan Information Banners */}
      {(propertyData || ratePlanData) && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {propertyData && (
            <div className="bg-brand-50 border border-brand-200 rounded-lg p-3">
              <p className="text-sm font-semibold text-brand-900">
                {t('ratePlanRates.form.propertyOfRate')}: <span className="font-bold text-brand-700">{propertyData.title}</span>
              </p>
            </div>
          )}
          {ratePlanData && (
            <div className="bg-brand-50 border border-brand-200 rounded-lg p-3">
              <p className="text-sm font-semibold text-brand-900">
                {t('ratePlanRates.form.ratePlanOfRate')}: <span className="font-bold text-brand-700">{ratePlanData.title}</span>
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

      {/* Property and Rate Plan Selectors (only if not preselected) */}
      {!initialRatePlanId && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <PropertySearchSelect
              label={`${t('ratePlanRates.form.property')} *`}
              value={propertyId}
              onChange={setPropertyId}
              disabled={isEditMode || isLoading}
              error={validationErrors.propertyId}
            />
          </div>

          <div className="space-y-1.5">
            <RatePlanSearchSelect
              label={`${t('ratePlanRates.form.ratePlan')} *`}
              value={ratePlanId}
              onChange={setRatePlanId}
              disabled={isEditMode || isLoading}
              error={validationErrors.ratePlanId}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="date" className="text-sm font-medium">
            {t('ratePlanRates.form.date')} <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={validationErrors.date}
            disabled={isEditMode || isLoading}
            className="text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rate" className="text-sm font-medium">
            {t('ratePlanRates.form.rate')} <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            id="rate"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            min="0"
            step="0.01"
            error={validationErrors.rate}
            disabled={isLoading}
            className="text-sm"
          />
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

export default RatePlanRateForm;
