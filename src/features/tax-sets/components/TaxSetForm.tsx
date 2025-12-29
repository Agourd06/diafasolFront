import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CURRENCY_CODES, isValidISO4217Currency } from '@/utils/constants/currencies';
import PropertySearchSelect from '@/components/inputs/PropertySearchSelect';
import { usePropertyById } from '@/features/properties/hooks/usePropertyById';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';
import { useCreateTaxSet } from '../hooks/useCreateTaxSet';
import { useUpdateTaxSet } from '../hooks/useUpdateTaxSet';
import { useToast } from '@/context/ToastContext';
import type { TaxSet } from '../types';

interface TaxSetFormProps {
  taxSet?: TaxSet;
  initialPropertyId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TaxSetForm: React.FC<TaxSetFormProps> = ({
  taxSet,
  initialPropertyId,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const isEditMode = !!taxSet;
  const createMutation = useCreateTaxSet();
  const updateMutation = useUpdateTaxSet();

  const [title, setTitle] = useState(taxSet?.title || '');
  const [propertyId, setPropertyId] = useState(taxSet?.propertyId || initialPropertyId || '');
  const [currency, setCurrency] = useState(taxSet?.currency || 'USD');
  const [status, setStatus] = useState(taxSet?.status ?? 1);

  // Fetch property information for display
  const currentPropertyId = taxSet?.propertyId || initialPropertyId || '';
  const { data: propertyData } = usePropertyById(currentPropertyId);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (taxSet) {
      setTitle(taxSet.title || '');
      setPropertyId(taxSet.propertyId || '');
      setCurrency(taxSet.currency || 'USD');
      setStatus(taxSet.status ?? 1);
    } else if (initialPropertyId) {
      setPropertyId(initialPropertyId);
    }
  }, [taxSet, initialPropertyId]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = t('taxSets.validation.titleRequired');
    } else if (title.length > 255) {
      errors.title = t('taxSets.validation.titleTooLong');
    }

    if (!propertyId.trim()) {
      errors.propertyId = t('taxSets.validation.propertyRequired');
    }

    if (!currency.trim()) {
      errors.currency = t('taxSets.validation.currencyRequired');
    } else if (!isValidISO4217Currency(currency.trim())) {
      errors.currency = t('taxSets.validation.currencyInvalid');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      title: title.trim(),
      propertyId: propertyId.trim(),
      currency: currency.trim().toUpperCase(),
      status,
    };

    try {
      if (isEditMode && taxSet) {
        await updateMutation.mutateAsync({ id: taxSet.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setTitle('');
      setPropertyId(initialPropertyId || '');
      setCurrency('USD');
      setStatus(1);
      setValidationErrors({});
      onSuccess?.();
      if (isEditMode) {
        showSuccess(t('taxSets.updateSuccess', { defaultValue: 'Tax set updated successfully!' }));
      } else {
        showSuccess(t('taxSets.createSuccess', { defaultValue: 'Tax set created successfully!' }));
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
            {t('taxSets.form.propertyOfTaxSet')}: <span className="font-bold text-brand-700">{propertyData.title}</span>
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
          {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-sm font-medium">
          {t('taxSets.form.title')} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('taxSets.form.titlePlaceholder')}
          error={validationErrors.title}
          disabled={isLoading}
          required
          className="text-sm"
        />
      </div>

      {/* Property Selector (only if not preselected) */}
      {!initialPropertyId && (
        <div className="space-y-1.5">
          <Label htmlFor="propertyId" className="text-sm font-medium">
            {t('taxSets.form.property')} <span className="text-red-500">*</span>
          </Label>
          <PropertySearchSelect
            label=""
            value={propertyId}
            onChange={setPropertyId}
            disabled={isLoading}
            error={validationErrors.propertyId}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="currency" className="text-sm font-medium">
          {t('taxSets.form.currency')} <span className="text-red-500">*</span>
        </Label>
        <select
          id="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value.toUpperCase())}
          disabled={isLoading}
          className={`w-full rounded-lg border text-sm px-3 py-2 ${
            validationErrors.currency
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500'
          } focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500`}
          required
        >
          <option value="">{t('taxSets.form.selectCurrency')}</option>
          {CURRENCY_CODES.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.code} - {currency.name}
            </option>
          ))}
        </select>
        {validationErrors.currency && (
          <p className="text-xs text-red-600">{validationErrors.currency}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="status" className="text-sm font-medium">
          {t('taxSets.form.status')}
        </Label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(Number(e.target.value))}
          disabled={isLoading}
          className="w-full rounded-lg border border-slate-300 focus:border-brand-500 focus:ring-brand-500 px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500"
        >
          <option value={1}>{t('taxSets.status.active')}</option>
          <option value={0}>{t('taxSets.status.inactive')}</option>
        </select>
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

export default TaxSetForm;
