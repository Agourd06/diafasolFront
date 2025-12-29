import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueries } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { ActionButtons } from '../../../components/ui/ActionButtons';
import Loader from '../../../components/Loader';
import { useConfirmModal } from '../../../hooks/useConfirmModal';
import { ReservationCancellationPolicy } from '../types';
import { useDeleteReservationCancellationPolicy } from '../hooks/useDeleteReservationCancellationPolicy';
import { getPropertyById } from '../../../api/properties.api';

type Props = {
  policies?: ReservationCancellationPolicy[];
  isLoading?: boolean;
  error?: unknown;
};

const ReservationCancellationPolicyTable: React.FC<Props> = ({
  policies = [],
  isLoading,
  error,
}) => {
  const { t } = useTranslation();
  const deleteMutation = useDeleteReservationCancellationPolicy();
  const deleteModal = useConfirmModal();
  const [selectedPolicy, setSelectedPolicy] = useState<ReservationCancellationPolicy | null>(null);

  // Fetch property names
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

  const handleDeleteClick = (policy: ReservationCancellationPolicy) => {
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
      <Card title={t('reservationCancellationPolicies.title')}>
        <Loader label={t('reservationCancellationPolicies.table.loading')} />
      </Card>
    );
  }

  if (error) {
    const axiosError = error as any;
    let errorMessage = t('reservationCancellationPolicies.table.error');

    if (axiosError?.response?.data?.message) {
      errorMessage = axiosError.response.data.message;
    } else if (axiosError?.message) {
      errorMessage = axiosError.message;
    }

    return (
      <Card title={t('reservationCancellationPolicies.title')}>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      </Card>
    );
  }

  if (!policies.length) {
    return (
      <Card title={t('reservationCancellationPolicies.title')}>
        <p className="text-sm text-slate-600">
          {t('reservationCancellationPolicies.table.empty')}
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card
        title={t('reservationCancellationPolicies.title')}
        subtitle={t('reservationCancellationPolicies.table.subtitle')}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('reservationCancellationPolicies.table.title')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('reservationCancellationPolicies.table.property')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('reservationCancellationPolicies.table.refundable')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('reservationCancellationPolicies.table.penalty')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('reservationCancellationPolicies.table.dateRanges')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  {t('reservationCancellationPolicies.table.actions')}
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
                      <span className="text-xs font-mono">
                        {policy.propertyId.substring(0, 8)}...
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {policy.isRefundable ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {t('common.yes')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {t('common.no')}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {policy.penaltyValue} {policy.penaltyLogic}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <Link
                      to={`/reservation-cancellation-policy-date-ranges?policyId=${policy.id}`}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                      title={t('reservationCancellationPolicies.table.manageDateRanges')}
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
                      editPath={`/reservation-cancellation-policies/edit/${policy.id}`}
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
            ? t('modal.delete.messageReservationCancellationPolicy', { name: selectedPolicy.title })
            : t('modal.delete.message')
        }
        confirmText={t('modal.delete.confirm')}
        cancelText={t('modal.delete.cancel')}
        variant="danger"
      />
    </>
  );
};

export default ReservationCancellationPolicyTable;

