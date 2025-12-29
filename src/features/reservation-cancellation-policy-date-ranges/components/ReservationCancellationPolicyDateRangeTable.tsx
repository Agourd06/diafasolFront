import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueries } from '@tanstack/react-query';
import Card from '../../../components/ui/Card';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { ActionButtons } from '../../../components/ui/ActionButtons';
import Loader from '../../../components/Loader';
import { useConfirmModal } from '../../../hooks/useConfirmModal';
import { ReservationCancellationPolicyDateRange } from '../types';
import { useDeleteReservationCancellationPolicyDateRange } from '../hooks/useDeleteReservationCancellationPolicyDateRange';
import { getReservationCancellationPolicyById } from '../../../api/reservation-cancellation-policies.api';

type Props = {
  dateRanges?: ReservationCancellationPolicyDateRange[];
  isLoading?: boolean;
  error?: unknown;
};

const ReservationCancellationPolicyDateRangeTable: React.FC<Props> = ({
  dateRanges = [],
  isLoading,
  error,
}) => {
  const { t } = useTranslation();
  const deleteMutation = useDeleteReservationCancellationPolicyDateRange();
  const deleteModal = useConfirmModal();
  const [selectedDateRange, setSelectedDateRange] =
    useState<ReservationCancellationPolicyDateRange | null>(null);

  // Fetch policy titles
  const uniquePolicyIds = useMemo(() => {
    const ids = new Set<string>();
    dateRanges.forEach((range) => ids.add(range.policyId));
    return Array.from(ids);
  }, [dateRanges]);

  const policyQueries = useQueries({
    queries: uniquePolicyIds.map((id) => ({
      queryKey: ['reservationCancellationPolicy', id],
      queryFn: () => getReservationCancellationPolicyById(id),
      staleTime: 5 * 60 * 1000,
      enabled: !!id,
    })),
  });

  const policyTitlesMap = useMemo(() => {
    const map = new Map<string, string>();
    policyQueries.forEach((query) => {
      if (query.data) {
        map.set(query.data.id, query.data.title);
      }
    });
    return map;
  }, [policyQueries]);

  const handleDeleteClick = (dateRange: ReservationCancellationPolicyDateRange) => {
    setSelectedDateRange(dateRange);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDateRange) return;

    await deleteModal.handleConfirm(async () => {
      await deleteMutation.mutateAsync(selectedDateRange.id);
      setSelectedDateRange(null);
    });
  };

  if (isLoading) {
    return (
      <Card title={t('reservationCancellationPolicyDateRanges.title')}>
        <Loader label={t('reservationCancellationPolicyDateRanges.table.loading')} />
      </Card>
    );
  }

  if (error) {
    const axiosError = error as any;
    let errorMessage = t('reservationCancellationPolicyDateRanges.table.error');

    if (axiosError?.response?.data?.message) {
      errorMessage = axiosError.response.data.message;
    } else if (axiosError?.message) {
      errorMessage = axiosError.message;
    }

    return (
      <Card title={t('reservationCancellationPolicyDateRanges.title')}>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      </Card>
    );
  }

  if (!dateRanges.length) {
    return (
      <Card title={t('reservationCancellationPolicyDateRanges.title')}>
        <p className="text-sm text-slate-600">
          {t('reservationCancellationPolicyDateRanges.table.empty')}
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card
        title={t('reservationCancellationPolicyDateRanges.title')}
        subtitle={t('reservationCancellationPolicyDateRanges.table.subtitle')}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('reservationCancellationPolicyDateRanges.table.policy')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('reservationCancellationPolicyDateRanges.table.dateAfter')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('reservationCancellationPolicyDateRanges.table.dateBefore')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  {t('reservationCancellationPolicyDateRanges.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dateRanges.map((dateRange) => (
                <tr key={dateRange.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600">
                    {policyTitlesMap.get(dateRange.policyId) || (
                      <span className="text-xs font-mono">
                        {dateRange.policyId.substring(0, 8)}...
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(dateRange.dateAfter).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(dateRange.dateBefore).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <ActionButtons
                      editPath={`/reservation-cancellation-policy-date-ranges/edit/${dateRange.id}`}
                      onDelete={() => handleDeleteClick(dateRange)}
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
        message={t('modal.delete.messageReservationCancellationPolicyDateRange')}
        confirmText={t('modal.delete.confirm')}
        cancelText={t('modal.delete.cancel')}
        variant="danger"
      />
    </>
  );
};

export default ReservationCancellationPolicyDateRangeTable;

