import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Loader from '../../../components/Loader';
import ReservationCancellationPolicyForm from '../components/ReservationCancellationPolicyForm';
import { useReservationCancellationPolicy } from '../hooks/useReservationCancellationPolicy';
import { useUpdateReservationCancellationPolicy } from '../hooks/useUpdateReservationCancellationPolicy';
import { useReservationCancellationPolicyDateRangesByPolicy } from '../../reservation-cancellation-policy-date-ranges/hooks/useReservationCancellationPolicyDateRangesByPolicy';
import type { UpdateReservationCancellationPolicyDto } from '../types';

const EditReservationCancellationPolicy: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: policy, isLoading, error } = useReservationCancellationPolicy(id!);
  const updateMutation = useUpdateReservationCancellationPolicy();
  const {
    data: dateRanges = [],
    isLoading: dateRangesLoading,
  } = useReservationCancellationPolicyDateRangesByPolicy(id!);

  const handleSubmit = async (data: UpdateReservationCancellationPolicyDto) => {
    try {
      await updateMutation.mutateAsync({ id: id!, data });
      navigate('/reservation-cancellation-policies');
    } catch (error) {
      console.error('Failed to update reservation cancellation policy:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <Loader label={t('common.loading')} />
      </Card>
    );
  }

  if (error || !policy) {
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
            {t('reservationCancellationPolicies.editTitle')}
          </h1>
          <p className="text-slate-600 mt-1">
            {t('reservationCancellationPolicies.editDescription')}
          </p>
        </div>

        {/* Form */}
        <Card>
          <ReservationCancellationPolicyForm
            initialData={policy}
            onSubmit={handleSubmit}
            isLoading={updateMutation.isPending}
          />
        </Card>

        {/* Date Ranges Management */}
        <Card
          title={t('reservationCancellationPolicies.dateRanges.title')}
          subtitle={t('reservationCancellationPolicies.dateRanges.subtitle')}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  {dateRangesLoading
                    ? t('common.loading')
                    : `${dateRanges.length} ${
                        dateRanges.length === 1
                          ? t('reservationCancellationPolicies.dateRanges.count')
                          : t('reservationCancellationPolicies.dateRanges.count_plural')
                      }`}
                </p>
              </div>
              <Link to={`/reservation-cancellation-policy-date-ranges?policyId=${id}`}>
                <Button variant="primary" className="text-sm px-3 py-1.5">
                  {t('reservationCancellationPolicies.dateRanges.manage')}
                </Button>
              </Link>
            </div>
            {dateRanges.length > 0 && (
              <div className="mt-4 space-y-2">
                {dateRanges.map((range) => (
                  <div
                    key={range.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="text-sm">
                      <span className="font-medium text-slate-900">
                        {new Date(range.dateAfter).toLocaleDateString()}
                      </span>
                      <span className="mx-2 text-slate-400">→</span>
                      <span className="font-medium text-slate-900">
                        {new Date(range.dateBefore).toLocaleDateString()}
                      </span>
                    </div>
                    <Link
                      to={`/reservation-cancellation-policy-date-ranges/edit/${range.id}?policyId=${id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {t('common.edit')}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
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

export default EditReservationCancellationPolicy;

