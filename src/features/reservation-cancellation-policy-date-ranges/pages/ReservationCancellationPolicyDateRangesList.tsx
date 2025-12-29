import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import ReservationCancellationPolicyDateRangeTable from '../components/ReservationCancellationPolicyDateRangeTable';
import { useReservationCancellationPolicyDateRangesByPolicy } from '../hooks/useReservationCancellationPolicyDateRangesByPolicy';

const ReservationCancellationPolicyDateRangesList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const policyId = searchParams.get('policyId') || '';

  const {
    data: dateRanges = [],
    isLoading,
    error,
  } = useReservationCancellationPolicyDateRangesByPolicy(policyId);

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {t('reservationCancellationPolicyDateRanges.title')}
            </h1>
            <p className="text-slate-600 mt-1">
              {t('reservationCancellationPolicyDateRanges.description')} • {dateRanges.length}{' '}
              {t('reservationCancellationPolicyDateRanges.rangesCount')}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() =>
              navigate(`/reservation-cancellation-policy-date-ranges/create?policyId=${policyId}`)
            }
          >
            {t('reservationCancellationPolicyDateRanges.addRange')}
          </Button>
        </div>

        {/* Table */}
        <ReservationCancellationPolicyDateRangeTable
          dateRanges={dateRanges}
          isLoading={isLoading}
          error={error}
        />
    </div>
  );
};

export default ReservationCancellationPolicyDateRangesList;

