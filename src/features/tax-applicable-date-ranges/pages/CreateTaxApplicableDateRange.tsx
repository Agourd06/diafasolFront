import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import TaxApplicableDateRangeForm from '../components/TaxApplicableDateRangeForm';
import { useCreateTaxApplicableDateRange } from '../hooks/useCreateTaxApplicableDateRange';
import type { CreateTaxApplicableDateRangePayload } from '../types';

const CreateTaxApplicableDateRange: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createMutation = useCreateTaxApplicableDateRange();

  const handleSubmit = async (data: CreateTaxApplicableDateRangePayload) => {
    await createMutation.mutateAsync(data);
    navigate('/tax-applicable-date-ranges');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('taxApplicableDateRanges.create.title')}</h1>
          <p className="text-sm text-slate-600">{t('taxApplicableDateRanges.create.subtitle')}</p>
        </div>
        <Link to="/tax-applicable-date-ranges">
          <Button variant="outline">{t('common.back')}</Button>
        </Link>
      </div>
      <TaxApplicableDateRangeForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        error={createMutation.error}
      />
    </div>
  );
};

export default CreateTaxApplicableDateRange;

