import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import ReservationAdvancePolicyDateRangeTable from '../components/ReservationAdvancePolicyDateRangeTable';
import { useReservationAdvancePolicyDateRangesByPolicy } from '../hooks/useReservationAdvancePolicyDateRangesByPolicy';

const ReservationAdvancePolicyDateRangesList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const policyId = searchParams.get('policyId') || '';

  const { data: dateRanges = [], isLoading, error } = useReservationAdvancePolicyDateRangesByPolicy(policyId);

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {t('reservationAdvancePolicyDateRanges.title')}
            </h1>
            <p className="text-slate-600 mt-1">
              {t('reservationAdvancePolicyDateRanges.description')} • {dateRanges.length}{' '}
              {t('reservationAdvancePolicyDateRanges.rangesCount')}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() =>
              navigate(`/reservation-advance-policy-date-ranges/create?policyId=${policyId}`)
            }
          >
            {t('reservationAdvancePolicyDateRanges.addRange')}
          </Button>
        </div>

        {/* Table */}
        <ReservationAdvancePolicyDateRangeTable
          dateRanges={dateRanges}
          isLoading={isLoading}
          error={error}
        />
    </div>
  );
};

export default ReservationAdvancePolicyDateRangesList;

