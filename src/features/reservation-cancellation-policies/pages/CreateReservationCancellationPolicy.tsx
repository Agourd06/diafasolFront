import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import ReservationCancellationPolicyForm from '../components/ReservationCancellationPolicyForm';
import { useCreateReservationCancellationPolicy } from '../hooks/useCreateReservationCancellationPolicy';
import type { CreateReservationCancellationPolicyDto } from '../types';

const CreateReservationCancellationPolicy: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createMutation = useCreateReservationCancellationPolicy();

  const handleSubmit = async (data: CreateReservationCancellationPolicyDto) => {
    try {
      await createMutation.mutateAsync(data);
      navigate('/reservation-cancellation-policies');
    } catch (error) {
      console.error('Failed to create reservation cancellation policy:', error);
    }
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t('reservationCancellationPolicies.createTitle')}
          </h1>
          <p className="text-slate-600 mt-1">
            {t('reservationCancellationPolicies.createDescription')}
          </p>
        </div>

        {/* Form */}
        <Card>
          <ReservationCancellationPolicyForm
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

export default CreateReservationCancellationPolicy;

