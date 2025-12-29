import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@/utils/validation';
import TaxSearchSelect from '@/components/inputs/TaxSearchSelect';
import type { TaxApplicableDateRange, CreateTaxApplicableDateRangePayload, UpdateTaxApplicableDateRangePayload } from '../types';

interface TaxApplicableDateRangeFormProps {
  dateRange?: TaxApplicableDateRange;
  onSubmit: (data: CreateTaxApplicableDateRangePayload | UpdateTaxApplicableDateRangePayload) => Promise<void>;
  isLoading?: boolean;
  error?: Error | null;
}

const TaxApplicableDateRangeForm: React.FC<TaxApplicableDateRangeFormProps> = ({
  dateRange,
  onSubmit,
  isLoading = false,
  error,
}) => {
  const { t } = useTranslation();
  const isEditMode = !!dateRange;

  const [taxId, setTaxId] = useState(dateRange?.taxId || '');
  const [dateAfter, setDateAfter] = useState(dateRange?.dateAfter || '');
  const [dateBefore, setDateBefore] = useState(dateRange?.dateBefore || '');

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (dateRange) {
      setTaxId(dateRange.taxId || '');
      setDateAfter(dateRange.dateAfter || '');
      setDateBefore(dateRange.dateBefore || '');
    }
  }, [dateRange]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!taxId.trim()) {
      errors.taxId = t('taxApplicableDateRanges.validation.taxRequired');
    }

    if (!dateAfter) {
      errors.dateAfter = t('taxApplicableDateRanges.validation.dateAfterRequired');
    }

    if (!dateBefore) {
      errors.dateBefore = t('taxApplicableDateRanges.validation.dateBeforeRequired');
    }

    // Validate end date is after or equal to start date
    if (dateAfter && dateBefore && new Date(dateBefore) < new Date(dateAfter)) {
      errors.dateBefore = t('taxApplicableDateRanges.validation.dateBeforeAfterDateAfter');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData: CreateTaxApplicableDateRangePayload | UpdateTaxApplicableDateRangePayload = {
      taxId: taxId.trim(),
      dateAfter: dateAfter.trim(),
      dateBefore: dateBefore.trim(),
    };

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">{t('common.error')}</p>
          <p className="text-sm">{getErrorMessage(error)}</p>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('taxApplicableDateRanges.form.basicInfo')}
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          {/* Tax */}
          <div>
            <TaxSearchSelect
              label={`${t('taxApplicableDateRanges.form.tax')} *`}
              value={taxId}
              onChange={setTaxId}
              error={validationErrors.taxId}
              disabled={isEditMode}
            />
          </div>

          {/* Date After */}
          <div>
            <label htmlFor="dateAfter" className="block text-sm font-medium text-gray-700 mb-1">
              {t('taxApplicableDateRanges.form.dateAfter')} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="dateAfter"
              value={dateAfter}
              onChange={(e) => setDateAfter(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                validationErrors.dateAfter ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isEditMode}
            />
            {validationErrors.dateAfter && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.dateAfter}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">{t('taxApplicableDateRanges.form.dateAfterHelp')}</p>
          </div>

          {/* Date Before */}
          <div>
            <label htmlFor="dateBefore" className="block text-sm font-medium text-gray-700 mb-1">
              {t('taxApplicableDateRanges.form.dateBefore')} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="dateBefore"
              value={dateBefore}
              onChange={(e) => setDateBefore(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                validationErrors.dateBefore ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isEditMode}
            />
            {validationErrors.dateBefore && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.dateBefore}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">{t('taxApplicableDateRanges.form.dateBeforeHelp')}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={isLoading}
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? t('common.saving') : isEditMode ? t('common.update') : t('common.create')}
        </button>
      </div>
    </form>
  );
};

export default TaxApplicableDateRangeForm;

