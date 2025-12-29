import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@/utils/validation';
import PropertySearchSelect from '@/components/inputs/PropertySearchSelect';
import { usePropertyById } from '@/features/properties/hooks/usePropertyById';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';
import { TAX_LOGIC_OPTIONS, isValidTaxLogic } from '@/utils/constants/tax-logics';
import { TAX_TYPE_OPTIONS, isValidTaxType } from '@/utils/constants/tax-types';
import { useCreateTax } from '../hooks/useCreateTax';
import { useUpdateTax } from '../hooks/useUpdateTax';
import { useToast } from '@/context/ToastContext';
import type { Tax } from '../types';

interface TaxFormProps {
  tax?: Tax;
  defaultPropertyId?: string;
  onSuccess?: (createdTax?: Tax) => void;
  onCancel?: () => void;
}

const TaxForm: React.FC<TaxFormProps> = ({
  tax,
  defaultPropertyId,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const isEditMode = !!tax;
  const createMutation = useCreateTax();
  const updateMutation = useUpdateTax();

  const [propertyId, setPropertyId] = useState(tax?.propertyId || defaultPropertyId || '');
  const [title, setTitle] = useState(tax?.title || '');
  const [logic, setLogic] = useState(tax?.logic || '');
  const [type, setType] = useState(tax?.type || '');
  const [rate, setRate] = useState(tax?.rate?.toString() || '');
  const [isInclusive, setIsInclusive] = useState(tax?.isInclusive || false);
  const [skipNights, setSkipNights] = useState(tax?.skipNights?.toString() || '');
  const [maxNights, setMaxNights] = useState(tax?.maxNights?.toString() || '');

  // Fetch property information for display
  const currentPropertyId = tax?.propertyId || defaultPropertyId || '';
  const { data: propertyData } = usePropertyById(currentPropertyId);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (tax) {
      setPropertyId(tax.propertyId || '');
      setTitle(tax.title || '');
      setLogic(tax.logic || '');
      setType(tax.type || '');
      setRate(tax.rate?.toString() || '');
      setIsInclusive(tax.isInclusive || false);
      setSkipNights(tax.skipNights?.toString() || '');
      setMaxNights(tax.maxNights?.toString() || '');
    } else if (defaultPropertyId) {
      setPropertyId(defaultPropertyId);
    }
  }, [tax, defaultPropertyId]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!propertyId.trim()) {
      errors.propertyId = t('taxes.validation.propertyRequired');
    }

    if (!title.trim()) {
      errors.title = t('taxes.validation.titleRequired');
    }

    if (!logic.trim()) {
      errors.logic = t('taxes.validation.logicRequired');
    } else if (!isValidTaxLogic(logic.trim())) {
      errors.logic = t('taxes.validation.logicInvalid');
    }

    if (!type.trim()) {
      errors.type = t('taxes.validation.typeRequired');
    } else if (!isValidTaxType(type.trim())) {
      errors.type = t('taxes.validation.typeInvalid');
    }

    if (!rate) {
      errors.rate = t('taxes.validation.rateRequired');
    } else if (isNaN(Number(rate)) || Number(rate) < 0) {
      errors.rate = t('taxes.validation.rateInvalid');
    }

    if (skipNights && (isNaN(Number(skipNights)) || Number(skipNights) < 1)) {
      errors.skipNights = t('taxes.validation.skipNightsInvalid');
    }

    if (maxNights && (isNaN(Number(maxNights)) || Number(maxNights) < 1)) {
      errors.maxNights = t('taxes.validation.maxNightsInvalid');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData = {
      propertyId: propertyId.trim(),
      title: title.trim(),
      logic: logic.trim(),
      type: type.trim(),
      rate: Number(rate),
      isInclusive,
      skipNights: skipNights ? Number(skipNights) : undefined,
      maxNights: maxNights ? Number(maxNights) : undefined,
    };

    try {
      let result: Tax | undefined;
      if (isEditMode && tax) {
        result = await updateMutation.mutateAsync({ id: tax.id, payload: formData });
      } else {
        result = await createMutation.mutateAsync(formData);
      }
      // Reset form
      setPropertyId(defaultPropertyId || '');
      setTitle('');
      setLogic('');
      setType('');
      setRate('');
      setIsInclusive(false);
      setSkipNights('');
      setMaxNights('');
      setValidationErrors({});
      onSuccess?.(result);
      if (isEditMode) {
        showSuccess(t('taxes.updateSuccess', { defaultValue: 'Tax updated successfully!' }));
      } else {
        showSuccess(t('taxes.createSuccess', { defaultValue: 'Tax created successfully!' }));
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
            {t('taxes.form.propertyOfTax')}: <span className="font-bold text-brand-700">{propertyData.title}</span>
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
      {!defaultPropertyId && (
        <div className="space-y-1.5">
          <PropertySearchSelect
            label={`${t('taxes.form.property')} *`}
            value={propertyId}
            onChange={setPropertyId}
            error={validationErrors.propertyId}
            disabled={isEditMode || isLoading}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-sm font-medium">
          {t('taxes.form.title')} <span className="text-red-500">*</span>
        </Label>
        <Input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('taxes.form.titlePlaceholder')}
          disabled={isLoading}
          className={`text-sm ${validationErrors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
        />
        {validationErrors.title && (
          <p className="text-xs text-red-600">{validationErrors.title}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="logic" className="text-sm font-medium">
            {t('taxes.form.logic')} <span className="text-red-500">*</span>
          </Label>
          <select
            id="logic"
            value={logic}
            onChange={(e) => setLogic(e.target.value)}
            disabled={isLoading}
            className={`w-full rounded-lg border text-sm px-3 py-2 ${
              validationErrors.logic
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500'
            } focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500`}
          >
            <option value="">{t('taxes.form.selectLogic')}</option>
            {TAX_LOGIC_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(`taxes.form.logicOptions.${option.value}`) || option.label}
              </option>
            ))}
          </select>
          {validationErrors.logic && (
            <p className="text-xs text-red-600">{validationErrors.logic}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="type" className="text-sm font-medium">
            {t('taxes.form.type')} <span className="text-red-500">*</span>
          </Label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={isLoading}
            className={`w-full rounded-lg border text-sm px-3 py-2 ${
              validationErrors.type
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500'
            } focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500`}
          >
            <option value="">{t('taxes.form.selectType')}</option>
            {TAX_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(`taxes.form.typeOptions.${option.value}`) || option.label}
              </option>
            ))}
          </select>
          {validationErrors.type && (
            <p className="text-xs text-red-600">{validationErrors.type}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="rate" className="text-sm font-medium">
            {t('taxes.form.rate')} <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            id="rate"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            min="0"
            step="0.01"
            placeholder="10.00"
            disabled={isLoading}
            className={`text-sm ${validationErrors.rate ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
          />
          {validationErrors.rate ? (
            <p className="text-xs text-red-600">{validationErrors.rate}</p>
          ) : (
            <p className="text-xs text-slate-500">{t('taxes.form.rateHelp')}</p>
          )}
        </div>

        <div className="flex items-center pt-6">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isInclusive}
              onChange={(e) => setIsInclusive(e.target.checked)}
              disabled={isLoading}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <div>
              <span className="text-sm font-medium text-slate-700">{t('taxes.form.isInclusive')}</span>
              <p className="text-xs text-slate-500">{t('taxes.form.isInclusiveHelp')}</p>
            </div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="skipNights" className="text-sm font-medium">
            {t('taxes.form.skipNights')}
          </Label>
          <Input
            type="number"
            id="skipNights"
            value={skipNights}
            onChange={(e) => setSkipNights(e.target.value)}
            min="1"
            step="1"
            placeholder={t('common.optional')}
            disabled={isLoading}
            className={`text-sm ${validationErrors.skipNights ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
          />
          {validationErrors.skipNights ? (
            <p className="text-xs text-red-600">{validationErrors.skipNights}</p>
          ) : (
            <p className="text-xs text-slate-500">{t('taxes.form.skipNightsHelp')}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="maxNights" className="text-sm font-medium">
            {t('taxes.form.maxNights')}
          </Label>
          <Input
            type="number"
            id="maxNights"
            value={maxNights}
            onChange={(e) => setMaxNights(e.target.value)}
            min="1"
            step="1"
            placeholder={t('common.optional')}
            disabled={isLoading}
            className={`text-sm ${validationErrors.maxNights ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
          />
          {validationErrors.maxNights ? (
            <p className="text-xs text-red-600">{validationErrors.maxNights}</p>
          ) : (
            <p className="text-xs text-slate-500">{t('taxes.form.maxNightsHelp')}</p>
          )}
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

export default TaxForm;
