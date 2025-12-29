import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import ReservationCancellationPolicyDateRangeForm from '../components/ReservationCancellationPolicyDateRangeForm';
import { useCreateReservationCancellationPolicyDateRange } from '../hooks/useCreateReservationCancellationPolicyDateRange';
import type { CreateReservationCancellationPolicyDateRangeDto } from '../types';

const CreateReservationCancellationPolicyDateRange: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const policyId = searchParams.get('policyId') || '';
  const createMutation = useCreateReservationCancellationPolicyDateRange();

  const handleSubmit = async (data: CreateReservationCancellationPolicyDateRangeDto) => {
    try {
      await createMutation.mutateAsync(data);
      navigate(`/reservation-cancellation-policy-date-ranges?policyId=${policyId}`);
    } catch (error) {
      console.error('Failed to create date range:', error);
    }
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t('reservationCancellationPolicyDateRanges.createTitle')}
          </h1>
          <p className="text-slate-600 mt-1">
            {t('reservationCancellationPolicyDateRanges.createDescription')}
          </p>
        </div>

        {/* Form */}
        <Card>
          <ReservationCancellationPolicyDateRangeForm
            policyId={policyId}
            onSubmit={handleSubmit}
            isLoading={createMutation.isPending}
          />
        </Card>

        {/* Error Display */}
        {createMutation.isError && (
          <Card>
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-700">
                {(createMutation.error as any)?.response?.data?.message ||
                  (createMutation.error as Error)?.message ||
                  t('common.error')}
              </p>
            </div>
          </Card>
        )}
    </div>
  );
};

export default CreateReservationCancellationPolicyDateRange;

