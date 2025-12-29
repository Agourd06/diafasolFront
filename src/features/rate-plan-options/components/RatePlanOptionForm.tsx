import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@/utils/validation';
import RatePlanSearchSelect from '@/components/inputs/RatePlanSearchSelect';
import { useRatePlan } from '@/features/rate-plans/hooks/useRatePlan';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';
import { useCreateRatePlanOption } from '../hooks/useCreateRatePlanOption';
import { useUpdateRatePlanOption } from '../hooks/useUpdateRatePlanOption';
import { useToast } from '@/context/ToastContext';
import type { RatePlanOption } from '../types';

interface RatePlanOptionFormProps {
  ratePlanOption?: RatePlanOption;
  initialRatePlanId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const RatePlanOptionForm: React.FC<RatePlanOptionFormProps> = ({
  ratePlanOption,
  initialRatePlanId,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const isEditMode = !!ratePlanOption;
  const createMutation = useCreateRatePlanOption();
  const updateMutation = useUpdateRatePlanOption();

  const [ratePlanId, setRatePlanId] = useState(ratePlanOption?.ratePlanId || initialRatePlanId || '');
  const [occupancy, setOccupancy] = useState(ratePlanOption?.occupancy?.toString() || '1');
  const [isPrimary, setIsPrimary] = useState(ratePlanOption?.isPrimary || false);
  const [rate, setRate] = useState(ratePlanOption?.rate?.toString() || '0');

  // Fetch rate plan information for display
  const currentRatePlanId = ratePlanOption?.ratePlanId || initialRatePlanId || '';
  const { data: ratePlanData } = useRatePlan(currentRatePlanId);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (ratePlanOption) {
      setRatePlanId(ratePlanOption.ratePlanId || '');
      setOccupancy(ratePlanOption.occupancy?.toString() || '1');
      setIsPrimary(ratePlanOption.isPrimary || false);
      setRate(ratePlanOption.rate?.toString() || '0');
    } else if (initialRatePlanId) {
      setRatePlanId(initialRatePlanId);
    }
  }, [ratePlanOption, initialRatePlanId]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!ratePlanId.trim()) {
      errors.ratePlanId = t('ratePlanOptions.validation.ratePlanRequired');
    }

    const occupancyNum = parseInt(occupancy);
    if (isNaN(occupancyNum) || occupancyNum < 1) {
      errors.occupancy = t('ratePlanOptions.validation.occupancyInvalid');
    }

    const rateNum = parseFloat(rate);
    if (isNaN(rateNum) || rateNum < 0) {
      errors.rate = t('ratePlanOptions.validation.rateInvalid');
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
      ratePlanId: ratePlanId.trim(),
      occupancy: parseInt(occupancy),
      isPrimary,
      rate: parseFloat(rate),
    };

    try {
      if (isEditMode && ratePlanOption) {
        await updateMutation.mutateAsync({ id: ratePlanOption.id, payload: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      // Reset form
      setRatePlanId(initialRatePlanId || '');
      setOccupancy('1');
      setIsPrimary(false);
      setRate('0');
      setValidationErrors({});
      onSuccess?.();
      if (isEditMode) {
        showSuccess(t('ratePlanOptions.updateSuccess', { defaultValue: 'Option updated successfully!' }));
      } else {
        showSuccess(t('ratePlanOptions.createSuccess', { defaultValue: 'Option created successfully!' }));
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
      {/* Rate Plan Information Banner */}
      {ratePlanData && (
        <div className="bg-brand-50 border border-brand-200 rounded-lg p-3 mb-2">
          <p className="text-sm font-semibold text-brand-900">
            {t('ratePlanOptions.form.ratePlanOfOption')}: <span className="font-bold text-brand-700">{ratePlanData.title}</span>
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          <p className="font-medium">{t('common.error')}</p>
          <p className="text-xs mt-1">{getErrorMessage(error)}</p>
        </div>
      )}

      {/* Rate Plan Selector (only if not preselected) */}
      {!initialRatePlanId && (
        <div className="space-y-1.5">
          <RatePlanSearchSelect
            label={`${t('ratePlanOptions.form.ratePlan')} *`}
            value={ratePlanId}
            onChange={setRatePlanId}
            disabled={isEditMode || isLoading}
            error={validationErrors.ratePlanId}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="occupancy" className="text-sm font-medium">
            {t('ratePlanOptions.form.occupancy')} <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            id="occupancy"
            value={occupancy}
            onChange={(e) => setOccupancy(e.target.value)}
            min="1"
            step="1"
            error={validationErrors.occupancy}
            disabled={isLoading}
            className="text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rate" className="text-sm font-medium">
            {t('ratePlanOptions.form.rate')} <span className="text-red-500">*</span>
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

      <div className="space-y-1.5">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
            disabled={isLoading}
            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-slate-700">{t('ratePlanOptions.form.isPrimary')}</span>
        </label>
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

export default RatePlanOptionForm;
