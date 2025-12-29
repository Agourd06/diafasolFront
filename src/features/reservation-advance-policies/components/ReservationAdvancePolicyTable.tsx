import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueries } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { ActionButtons } from '../../../components/ui/ActionButtons';
import Loader from '../../../components/Loader';
import { useConfirmModal } from '../../../hooks/useConfirmModal';
import { ReservationAdvancePolicy } from '../types';
import { useDeleteReservationAdvancePolicy } from '../hooks/useDeleteReservationAdvancePolicy';
import { getPropertyById } from '../../../api/properties.api';

type Props = {
  policies?: ReservationAdvancePolicy[];
  isLoading?: boolean;
  error?: unknown;
};

const ReservationAdvancePolicyTable: React.FC<Props> = ({
  policies = [],
  isLoading,
  error,
}) => {
  const { t } = useTranslation();
  const deleteMutation = useDeleteReservationAdvancePolicy();
  const deleteModal = useConfirmModal();
  const [selectedPolicy, setSelectedPolicy] = useState<ReservationAdvancePolicy | null>(null);

  // Fetch property names for all unique propertyIds
  const uniquePropertyIds = useMemo(() => {
    const ids = new Set<string>();
    policies.forEach((policy) => ids.add(policy.propertyId));
    return Array.from(ids);
  }, [policies]);

  const propertyQueries = useQueries({
    queries: uniquePropertyIds.map((id) => ({
      queryKey: ['property', id],
      queryFn: () => getPropertyById(id),
      staleTime: 5 * 60 * 1000,
      enabled: !!id,
    })),
  });

  const propertyNamesMap = useMemo(() => {
    const map = new Map<string, string>();
    propertyQueries.forEach((query) => {
      if (query.data) {
        map.set(query.data.id, query.data.title);
      }
    });
    return map;
  }, [propertyQueries]);

  const handleDeleteClick = (policy: ReservationAdvancePolicy) => {
    setSelectedPolicy(policy);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPolicy) return;

    await deleteModal.handleConfirm(async () => {
      await deleteMutation.mutateAsync(selectedPolicy.id);
      setSelectedPolicy(null);
    });
  };

  if (isLoading) {
    return (
      <Card title={t('reservationAdvancePolicies.title')}>
        <Loader label={t('reservationAdvancePolicies.table.loading')} />
      </Card>
    );
  }

  if (error) {
    const axiosError = error as any;
    let errorMessage = t('reservationAdvancePolicies.table.error');

    if (axiosError?.response?.data?.message) {
      errorMessage = axiosError.response.data.message;
    } else if (axiosError?.message) {
      errorMessage = axiosError.message;
    }

    return (
      <Card title={t('reservationAdvancePolicies.title')}>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      </Card>
    );
  }

  if (!policies.length) {
    return (
      <Card title={t('reservationAdvancePolicies.title')}>
        <p className="text-sm text-slate-600">{t('reservationAdvancePolicies.table.empty')}</p>
      </Card>
    );
  }

  return (
    <>
      <Card
        title={t('reservationAdvancePolicies.title')}
        subtitle={t('reservationAdvancePolicies.table.subtitle')}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('reservationAdvancePolicies.table.title')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('reservationAdvancePolicies.table.property')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('reservationAdvancePolicies.table.charge')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('reservationAdvancePolicies.table.due')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('reservationAdvancePolicies.table.dateRanges')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  {t('reservationAdvancePolicies.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {policies.map((policy) => (
                <tr key={policy.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{policy.title}</p>
                    {policy.description && (
                      <p className="text-xs text-slate-500 mt-1">{policy.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {propertyNamesMap.get(policy.propertyId) || (
                      <span className="text-xs font-mono">{policy.propertyId.substring(0, 8)}...</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {policy.chargeValue} {policy.chargeLogic}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="text-xs">
                      {policy.dueType === 'at_booking'
                        ? t('reservationAdvancePolicies.form.dueTypeAtBooking')
                        : `${policy.dueDaysBeforeArrival || 0} ${t('common.daysBefore')}`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <Link
                      to={`/reservation-advance-policy-date-ranges?policyId=${policy.id}`}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                      title={t('reservationAdvancePolicies.table.manageDateRanges')}
                    >
                      {policy.dateRanges?.length || 0} {t('common.ranges')}
                      <svg
                        className="ml-1 h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <ActionButtons
                      editPath={`/reservation-advance-policies/edit/${policy.id}`}
                      onDelete={() => handleDeleteClick(policy)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteModal.isLoading}
        title={t('modal.delete.title')}
        message={
          selectedPolicy
            ? t('modal.delete.messageReservationAdvancePolicy', { name: selectedPolicy.title })
            : t('modal.delete.message')
        }
        confirmText={t('modal.delete.confirm')}
        cancelText={t('modal.delete.cancel')}
        variant="danger"
      />
    </>
  );
};

export default ReservationAdvancePolicyTable;

