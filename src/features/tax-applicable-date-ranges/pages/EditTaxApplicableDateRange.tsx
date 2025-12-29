import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Loader from '../../../components/Loader';
import TaxApplicableDateRangeForm from '../components/TaxApplicableDateRangeForm';
import { useTaxApplicableDateRange } from '../hooks/useTaxApplicableDateRange';
import { useUpdateTaxApplicableDateRange } from '../hooks/useUpdateTaxApplicableDateRange';
import type { UpdateTaxApplicableDateRangePayload } from '../types';

const EditTaxApplicableDateRange: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: dateRange, isLoading } = useTaxApplicableDateRange(parseInt(id!));
  const updateMutation = useUpdateTaxApplicableDateRange();

  const handleSubmit = async (data: UpdateTaxApplicableDateRangePayload) => {
    await updateMutation.mutateAsync({ id: parseInt(id!), payload: data });
    navigate('/tax-applicable-date-ranges');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <Loader label={t('common.loading')} />
        </Card>
      </div>
    );
  }

  if (!dateRange) {
    return (
      <div className="space-y-4">
        <Card>
          <p className="text-sm text-red-600">{t('taxApplicableDateRanges.edit.notFound')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('taxApplicableDateRanges.edit.title')}</h1>
          <p className="text-sm text-slate-600">{t('taxApplicableDateRanges.edit.subtitle')}</p>
        </div>
        <Link to="/tax-applicable-date-ranges">
          <Button variant="outline">{t('common.back')}</Button>
        </Link>
      </div>
      <TaxApplicableDateRangeForm
        dateRange={dateRange}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        error={updateMutation.error}
      />
    </div>
  );
};

export default EditTaxApplicableDateRange;

