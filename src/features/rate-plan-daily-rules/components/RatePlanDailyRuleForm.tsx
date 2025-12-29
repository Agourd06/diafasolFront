import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@/utils/validation';
import RatePlanSearchSelect from '@/components/inputs/RatePlanSearchSelect';
import { useRatePlan } from '@/features/rate-plans/hooks/useRatePlan';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';
import { useCreateRatePlanDailyRule } from '../hooks/useCreateRatePlanDailyRule';
import { useUpdateRatePlanDailyRule } from '../hooks/useUpdateRatePlanDailyRule';
import { useToast } from '@/context/ToastContext';
import type { RatePlanDailyRule } from '../types';

interface RatePlanDailyRuleFormProps {
  dailyRule?: RatePlanDailyRule;
  initialRatePlanId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const WEEKDAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
] as const;

const RatePlanDailyRuleForm: React.FC<RatePlanDailyRuleFormProps> = ({
  dailyRule,
  initialRatePlanId,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const isEditMode = !!dailyRule;
  const createMutation = useCreateRatePlanDailyRule();
  const updateMutation = useUpdateRatePlanDailyRule();

  const [ratePlanId, setRatePlanId] = useState(dailyRule?.ratePlanId || initialRatePlanId || '');
  const [weekday, setWeekday] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | ''>(dailyRule?.weekday || '');
  const [maxStay, setMaxStay] = useState(dailyRule?.maxStay?.toString() || '');
  const [minStayArrival, setMinStayArrival] = useState(dailyRule?.minStayArrival?.toString() || '');
  const [minStayThrough, setMinStayThrough] = useState(dailyRule?.minStayThrough?.toString() || '');
  const [closedToArrival, setClosedToArrival] = useState(dailyRule?.closedToArrival || false);
  const [closedToDeparture, setClosedToDeparture] = useState(dailyRule?.closedToDeparture || false);
  const [stopSell, setStopSell] = useState(dailyRule?.stopSell || false);

  // Fetch rate plan information for display
  const currentRatePlanId = dailyRule?.ratePlanId || initialRatePlanId || '';
  const { data: ratePlanData } = useRatePlan(currentRatePlanId);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (dailyRule) {
      setRatePlanId(dailyRule.ratePlanId || '');
      setWeekday(dailyRule.weekday || '');
      setMaxStay(dailyRule.maxStay?.toString() || '');
      setMinStayArrival(dailyRule.minStayArrival?.toString() || '');
      setMinStayThrough(dailyRule.minStayThrough?.toString() || '');
      setClosedToArrival(dailyRule.closedToArrival || false);
      setClosedToDeparture(dailyRule.closedToDeparture || false);
      setStopSell(dailyRule.stopSell || false);
    } else if (initialRatePlanId) {
      setRatePlanId(initialRatePlanId);
    }
  }, [dailyRule, initialRatePlanId]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!ratePlanId.trim()) {
      errors.ratePlanId = t('ratePlanDailyRules.validation.ratePlanRequired');
    }

    if (!weekday) {
      errors.weekday = t('ratePlanDailyRules.validation.weekdayRequired');
    }

    if (maxStay && (isNaN(Number(maxStay)) || Number(maxStay) < 1)) {
      errors.maxStay = t('ratePlanDailyRules.validation.maxStayInvalid');
    }

    if (minStayArrival && (isNaN(Number(minStayArrival)) || Number(minStayArrival) < 1)) {
      errors.minStayArrival = t('ratePlanDailyRules.validation.minStayArrivalInvalid');
    }

    if (minStayThrough && (isNaN(Number(minStayThrough)) || Number(minStayThrough) < 1)) {
      errors.minStayThrough = t('ratePlanDailyRules.validation.minStayThroughInvalid');
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
      weekday: weekday as 1 | 2 | 3 | 4 | 5 | 6 | 7,
      maxStay: maxStay ? Number(maxStay) : null,
      minStayArrival: minStayArrival ? Number(minStayArrival) : null,
      minStayThrough: minStayThrough ? Number(minStayThrough) : null,
      closedToArrival,
      closedToDeparture,
      stopSell,
    };

    try {
      if (isEditMode && dailyRule) {
        await updateMutation.mutateAsync({ id: dailyRule.id, payload: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      // Reset form
      setRatePlanId(initialRatePlanId || '');
      setWeekday('');
      setMaxStay('');
      setMinStayArrival('');
      setMinStayThrough('');
      setClosedToArrival(false);
      setClosedToDeparture(false);
      setStopSell(false);
      setValidationErrors({});
      onSuccess?.();
      if (isEditMode) {
        showSuccess(t('ratePlanDailyRules.updateSuccess', { defaultValue: 'Daily rule updated successfully!' }));
      } else {
        showSuccess(t('ratePlanDailyRules.createSuccess', { defaultValue: 'Daily rule created successfully!' }));
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
            {t('ratePlanDailyRules.form.ratePlanOfRule')}: <span className="font-bold text-brand-700">{ratePlanData.title}</span>
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
            label={`${t('ratePlanDailyRules.form.ratePlan')} *`}
            value={ratePlanId}
            onChange={setRatePlanId}
            error={validationErrors.ratePlanId}
            disabled={isEditMode || isLoading}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="weekday" className="text-sm font-medium">
          {t('ratePlanDailyRules.form.weekday')} <span className="text-red-500">*</span>
        </Label>
        <select
          id="weekday"
          value={weekday}
          onChange={(e) => setWeekday(Number(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6 | 7)}
          disabled={isEditMode || isLoading}
          className={`w-full rounded-lg border text-sm px-3 py-2 ${
            validationErrors.weekday
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500'
          } focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500`}
        >
          <option value="">{t('ratePlanDailyRules.form.selectWeekday')}</option>
          {WEEKDAYS.map((day) => (
            <option key={day.value} value={day.value}>
              {t(`ratePlanDailyRules.weekdays.${day.value}`)}
            </option>
          ))}
        </select>
        {validationErrors.weekday && (
          <p className="text-xs text-red-600">{validationErrors.weekday}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="maxStay" className="text-sm font-medium">
            {t('ratePlanDailyRules.form.maxStay')}
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
            {t('ratePlanDailyRules.form.minStayArrival')}
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
          {t('ratePlanDailyRules.form.minStayThrough')}
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
        <h4 className="text-sm font-semibold text-slate-900">{t('ratePlanDailyRules.form.restrictions')}</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={closedToArrival}
              onChange={(e) => setClosedToArrival(e.target.checked)}
              disabled={isLoading}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-700">{t('ratePlanDailyRules.form.closedToArrival')}</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={closedToDeparture}
              onChange={(e) => setClosedToDeparture(e.target.checked)}
              disabled={isLoading}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-700">{t('ratePlanDailyRules.form.closedToDeparture')}</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={stopSell}
              onChange={(e) => setStopSell(e.target.checked)}
              disabled={isLoading}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-700">{t('ratePlanDailyRules.form.stopSell')}</span>
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

export default RatePlanDailyRuleForm;
