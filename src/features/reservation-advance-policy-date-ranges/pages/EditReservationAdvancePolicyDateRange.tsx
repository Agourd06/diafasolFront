import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import Loader from '../../../components/Loader';
import ReservationAdvancePolicyDateRangeForm from '../components/ReservationAdvancePolicyDateRangeForm';
import { useReservationAdvancePolicyDateRange } from '../hooks/useReservationAdvancePolicyDateRange';
import { useUpdateReservationAdvancePolicyDateRange } from '../hooks/useUpdateReservationAdvancePolicyDateRange';
import type { UpdateReservationAdvancePolicyDateRangeDto } from '../types';

const EditReservationAdvancePolicyDateRange: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const policyId = searchParams.get('policyId') || '';
  const {
    data: dateRange,
    isLoading,
    error,
  } = useReservationAdvancePolicyDateRange(parseInt(id!, 10));
  const updateMutation = useUpdateReservationAdvancePolicyDateRange();

  const handleSubmit = async (data: UpdateReservationAdvancePolicyDateRangeDto) => {
    try {
      await updateMutation.mutateAsync({ id: parseInt(id!, 10), data });
      navigate(`/reservation-advance-policy-date-ranges?policyId=${policyId}`);
    } catch (error) {
      console.error('Failed to update date range:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <Loader label={t('common.loading')} />
      </Card>
    );
  }

  if (error || !dateRange) {
    return (
      <Card>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{t('common.error')}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t('reservationAdvancePolicyDateRanges.editTitle')}
          </h1>
          <p className="text-slate-600 mt-1">
            {t('reservationAdvancePolicyDateRanges.editDescription')}
          </p>
        </div>

        {/* Form */}
        <Card>
          <ReservationAdvancePolicyDateRangeForm
            policyId={policyId || dateRange.policyId}
            initialData={dateRange}
            onSubmit={handleSubmit}
            isLoading={updateMutation.isPending}
          />
        </Card>

        {/* Error Display */}
        {updateMutation.isError && (
          <Card>
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-700">
                {(updateMutation.error as any)?.response?.data?.message ||
                  (updateMutation.error as Error)?.message ||
                  t('common.error')}
              </p>
            </div>
          </Card>
        )}
    </div>
  );
};

export default EditReservationAdvancePolicyDateRange;

