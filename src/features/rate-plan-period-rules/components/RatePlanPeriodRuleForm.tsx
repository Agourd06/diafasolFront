import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@/utils/validation';
import RatePlanSearchSelect from '@/components/inputs/RatePlanSearchSelect';
import { useRatePlan } from '@/features/rate-plans/hooks/useRatePlan';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';
import { useCreateRatePlanPeriodRule } from '../hooks/useCreateRatePlanPeriodRule';
import { useUpdateRatePlanPeriodRule } from '../hooks/useUpdateRatePlanPeriodRule';
import { useToast } from '@/context/ToastContext';
import type { RatePlanPeriodRule } from '../types';

interface RatePlanPeriodRuleFormProps {
  periodRule?: RatePlanPeriodRule;
  initialRatePlanId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const RatePlanPeriodRuleForm: React.FC<RatePlanPeriodRuleFormProps> = ({
  periodRule,
  initialRatePlanId,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const isEditMode = !!periodRule;
  const createMutation = useCreateRatePlanPeriodRule();
  const updateMutation = useUpdateRatePlanPeriodRule();

  const [ratePlanId, setRatePlanId] = useState(periodRule?.ratePlanId || initialRatePlanId || '');
  const [startDate, setStartDate] = useState(periodRule?.startDate || '');
  const [endDate, setEndDate] = useState(periodRule?.endDate || '');
  const [maxStay, setMaxStay] = useState(periodRule?.maxStay?.toString() || '');
  const [minStayArrival, setMinStayArrival] = useState(periodRule?.minStayArrival?.toString() || '');
  const [minStayThrough, setMinStayThrough] = useState(periodRule?.minStayThrough?.toString() || '');
  const [closedToArrival, setClosedToArrival] = useState(periodRule?.closedToArrival || false);
  const [closedToDeparture, setClosedToDeparture] = useState(periodRule?.closedToDeparture || false);
  const [stopSell, setStopSell] = useState(periodRule?.stopSell || false);

  // Fetch rate plan information for display
  const currentRatePlanId = periodRule?.ratePlanId || initialRatePlanId || '';
  const { data: ratePlanData } = useRatePlan(currentRatePlanId);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (periodRule) {
      setRatePlanId(periodRule.ratePlanId || '');
      setStartDate(periodRule.startDate || '');
      setEndDate(periodRule.endDate || '');
      setMaxStay(periodRule.maxStay?.toString() || '');
      setMinStayArrival(periodRule.minStayArrival?.toString() || '');
      setMinStayThrough(periodRule.minStayThrough?.toString() || '');
      setClosedToArrival(periodRule.closedToArrival || false);
      setClosedToDeparture(periodRule.closedToDeparture || false);
      setStopSell(periodRule.stopSell || false);
    } else if (initialRatePlanId) {
      setRatePlanId(initialRatePlanId);
    }
  }, [periodRule, initialRatePlanId]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!ratePlanId.trim()) {
      errors.ratePlanId = t('ratePlanPeriodRules.validation.ratePlanRequired');
    }

    if (!startDate) {
      errors.startDate = t('ratePlanPeriodRules.validation.startDateRequired');
    }

    if (!endDate) {
      errors.endDate = t('ratePlanPeriodRules.validation.endDateRequired');
    }

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      errors.endDate = t('ratePlanPeriodRules.validation.endDateAfterStart');
    }

    if (maxStay && (isNaN(Number(maxStay)) || Number(maxStay) < 1)) {
      errors.maxStay = t('ratePlanPeriodRules.validation.maxStayInvalid');
    }

    if (minStayArrival && (isNaN(Number(minStayArrival)) || Number(minStayArrival) < 1)) {
      errors.minStayArrival = t('ratePlanPeriodRules.validation.minStayArrivalInvalid');
    }

    if (minStayThrough && (isNaN(Number(minStayThrough)) || Number(minStayThrough) < 1)) {
      errors.minStayThrough = t('ratePlanPeriodRules.validation.minStayThroughInvalid');
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
      startDate: startDate.trim(),
      endDate: endDate.trim(),
      maxStay: maxStay ? Number(maxStay) : null,
      minStayArrival: minStayArrival ? Number(minStayArrival) : null,
      minStayThrough: minStayThrough ? Number(minStayThrough) : null,
      closedToArrival,
      closedToDeparture,
      stopSell,
    };

    try {
      if (isEditMode && periodRule) {
        await updateMutation.mutateAsync({ id: periodRule.id, payload: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      // Reset form
      setRatePlanId(initialRatePlanId || '');
      setStartDate('');
      setEndDate('');
      setMaxStay('');
      setMinStayArrival('');
      setMinStayThrough('');
      setClosedToArrival(false);
      setClosedToDeparture(false);
      setStopSell(false);
      setValidationErrors({});
      onSuccess?.();
      if (isEditMode) {
        showSuccess(t('ratePlanPeriodRules.updateSuccess', { defaultValue: 'Period rule updated successfully!' }));
      } else {
        showSuccess(t('ratePlanPeriodRules.createSuccess', { defaultValue: 'Period rule created successfully!' }));
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
            {t('ratePlanPeriodRules.form.ratePlanOfRule')}: <span className="font-bold text-brand-700">{ratePlanData.title}</span>
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
            label={`${t('ratePlanPeriodRules.form.ratePlan')} *`}
            value={ratePlanId}
            onChange={setRatePlanId}
            disabled={isEditMode || isLoading}
            error={validationErrors.ratePlanId}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="startDate" className="text-sm font-medium">
            {t('ratePlanPeriodRules.form.startDate')} <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            error={validationErrors.startDate}
            disabled={isEditMode || isLoading}
            className="text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="endDate" className="text-sm font-medium">
            {t('ratePlanPeriodRules.form.endDate')} <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            error={validationErrors.endDate}
            disabled={isEditMode || isLoading}
            className="text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="maxStay" className="text-sm font-medium">
            {t('ratePlanPeriodRules.form.maxStay')}
          </Label>
          <Input
            type="number"
            id="maxStay"
            value={maxStay}
            onChange={(e) => setMaxStay(e.target.value)}
            min="1"
            step="1"
            placeholder={t('common.optional')}
            error={validationErrors.maxStay}
            disabled={isLoading}
            className="text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="minStayArrival" className="text-sm font-medium">
            {t('ratePlanPeriodRules.form.minStayArrival')}
          </Label>
          <Input
            type="number"
            id="minStayArrival"
            value={minStayArrival}
            onChange={(e) => setMinStayArrival(e.target.value)}
            min="1"
            step="1"
            placeholder={t('common.optional')}
            error={validationErrors.minStayArrival}
            disabled={isLoading}
            className="text-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="minStayThrough" className="text-sm font-medium">
          {t('ratePlanPeriodRules.form.minStayThrough')}
        </Label>
        <Input
          type="number"
          id="minStayThrough"
          value={minStayThrough}
          onChange={(e) => setMinStayThrough(e.target.value)}
          min="1"
          step="1"
          placeholder={t('common.optional')}
          error={validationErrors.minStayThrough}
          disabled={isLoading}
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-slate-900">{t('ratePlanPeriodRules.form.restrictions')}</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={closedToArrival}
              onChange={(e) => setClosedToArrival(e.target.checked)}
              disabled={isLoading}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-700">{t('ratePlanPeriodRules.form.closedToArrival')}</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={closedToDeparture}
              onChange={(e) => setClosedToDeparture(e.target.checked)}
              disabled={isLoading}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-700">{t('ratePlanPeriodRules.form.closedToDeparture')}</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={stopSell}
              onChange={(e) => setStopSell(e.target.checked)}
              disabled={isLoading}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-700">{t('ratePlanPeriodRules.form.stopSell')}</span>
          </label>
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

export default RatePlanPeriodRuleForm;
