import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import ReservationAdvancePolicyForm from '../components/ReservationAdvancePolicyForm';
import { useCreateReservationAdvancePolicy } from '../hooks/useCreateReservationAdvancePolicy';
import type { CreateReservationAdvancePolicyDto } from '../types';

const CreateReservationAdvancePolicy: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createMutation = useCreateReservationAdvancePolicy();

  const handleSubmit = async (data: CreateReservationAdvancePolicyDto) => {
    try {
      await createMutation.mutateAsync(data);
      navigate('/reservation-advance-policies');
    } catch (error) {
      console.error('Failed to create reservation advance policy:', error);
    }
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t('reservationAdvancePolicies.createTitle')}
          </h1>
          <p className="text-slate-600 mt-1">{t('reservationAdvancePolicies.createDescription')}</p>
        </div>

        {/* Form */}
        <Card>
          <ReservationAdvancePolicyForm
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

export default CreateReservationAdvancePolicy;

