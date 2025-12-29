import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@/utils/validation';
import RatePlanSearchSelect from '@/components/inputs/RatePlanSearchSelect';
import { useRatePlan } from '@/features/rate-plans/hooks/useRatePlan';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';
import { useCreateRatePlanAutoRateSetting } from '../hooks/useCreateRatePlanAutoRateSetting';
import { useUpdateRatePlanAutoRateSetting } from '../hooks/useUpdateRatePlanAutoRateSetting';
import { useToast } from '@/context/ToastContext';
import type { RatePlanAutoRateSetting } from '../types';

interface RatePlanAutoRateSettingFormProps {
  autoRateSetting?: RatePlanAutoRateSetting;
  initialRatePlanId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const RatePlanAutoRateSettingForm: React.FC<RatePlanAutoRateSettingFormProps> = ({
  autoRateSetting,
  initialRatePlanId,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const isEditMode = !!autoRateSetting;
  const createMutation = useCreateRatePlanAutoRateSetting();
  const updateMutation = useUpdateRatePlanAutoRateSetting();

  const [ratePlanId, setRatePlanId] = useState(autoRateSetting?.ratePlanId || initialRatePlanId || '');
  const [ruleName, setRuleName] = useState(autoRateSetting?.ruleName || '');
  const [ruleValue, setRuleValue] = useState(autoRateSetting?.ruleValue || '');

  // Fetch rate plan information for display
  const currentRatePlanId = autoRateSetting?.ratePlanId || initialRatePlanId || '';
  const { data: ratePlanData } = useRatePlan(currentRatePlanId);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (autoRateSetting) {
      setRatePlanId(autoRateSetting.ratePlanId || '');
      setRuleName(autoRateSetting.ruleName || '');
      setRuleValue(autoRateSetting.ruleValue || '');
    } else if (initialRatePlanId) {
      setRatePlanId(initialRatePlanId);
    }
  }, [autoRateSetting, initialRatePlanId]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!ratePlanId.trim()) {
      errors.ratePlanId = t('ratePlanAutoRateSettings.validation.ratePlanRequired');
    }

    if (!ruleName.trim()) {
      errors.ruleName = t('ratePlanAutoRateSettings.validation.ruleNameRequired');
    }

    if (!ruleValue.trim()) {
      errors.ruleValue = t('ratePlanAutoRateSettings.validation.ruleValueRequired');
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
      ruleName: ruleName.trim(),
      ruleValue: ruleValue.trim(),
    };

    try {
      if (isEditMode && autoRateSetting) {
        await updateMutation.mutateAsync({ id: autoRateSetting.id, payload: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      // Reset form
      setRatePlanId(initialRatePlanId || '');
      setRuleName('');
      setRuleValue('');
      setValidationErrors({});
      onSuccess?.();
      if (isEditMode) {
        showSuccess(t('ratePlanAutoRateSettings.updateSuccess', { defaultValue: 'Auto rate setting updated successfully!' }));
      } else {
        showSuccess(t('ratePlanAutoRateSettings.createSuccess', { defaultValue: 'Auto rate setting created successfully!' }));
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
            {t('ratePlanAutoRateSettings.form.ratePlanOfSetting')}: <span className="font-bold text-brand-700">{ratePlanData.title}</span>
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
            label={`${t('ratePlanAutoRateSettings.form.ratePlan')} *`}
            value={ratePlanId}
            onChange={setRatePlanId}
            disabled={isEditMode || isLoading}
            error={validationErrors.ratePlanId}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="ruleName" className="text-sm font-medium">
          {t('ratePlanAutoRateSettings.form.ruleName')} <span className="text-red-500">*</span>
        </Label>
        <Input
          type="text"
          id="ruleName"
          value={ruleName}
          onChange={(e) => setRuleName(e.target.value)}
          placeholder={t('ratePlanAutoRateSettings.form.ruleNamePlaceholder')}
          error={validationErrors.ruleName}
          disabled={isLoading}
          className="text-sm"
        />
        <p className="text-xs text-slate-500">{t('ratePlanAutoRateSettings.form.ruleNameHelp')}</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ruleValue" className="text-sm font-medium">
          {t('ratePlanAutoRateSettings.form.ruleValue')} <span className="text-red-500">*</span>
        </Label>
        <Input
          type="text"
          id="ruleValue"
          value={ruleValue}
          onChange={(e) => setRuleValue(e.target.value)}
          placeholder={t('ratePlanAutoRateSettings.form.ruleValuePlaceholder')}
          error={validationErrors.ruleValue}
          disabled={isLoading}
          className="text-sm"
        />
        <p className="text-xs text-slate-500">{t('ratePlanAutoRateSettings.form.ruleValueHelp')}</p>
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

export default RatePlanAutoRateSettingForm;
