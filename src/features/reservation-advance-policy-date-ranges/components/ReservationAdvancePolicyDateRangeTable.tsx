import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueries } from '@tanstack/react-query';
import Card from '../../../components/ui/Card';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { ActionButtons } from '../../../components/ui/ActionButtons';
import Loader from '../../../components/Loader';
import { useConfirmModal } from '../../../hooks/useConfirmModal';
import { ReservationAdvancePolicyDateRange } from '../types';
import { useDeleteReservationAdvancePolicyDateRange } from '../hooks/useDeleteReservationAdvancePolicyDateRange';
import { getReservationAdvancePolicyById } from '../../../api/reservation-advance-policies.api';

type Props = {
  dateRanges?: ReservationAdvancePolicyDateRange[];
  isLoading?: boolean;
  error?: unknown;
};

const ReservationAdvancePolicyDateRangeTable: React.FC<Props> = ({
  dateRanges = [],
  isLoading,
  error,
}) => {
  const { t } = useTranslation();
  const deleteMutation = useDeleteReservationAdvancePolicyDateRange();
  const deleteModal = useConfirmModal();
  const [selectedDateRange, setSelectedDateRange] =
    useState<ReservationAdvancePolicyDateRange | null>(null);

  // Fetch policy titles for all unique policyIds
  const uniquePolicyIds = useMemo(() => {
    const ids = new Set<string>();
    dateRanges.forEach((range) => ids.add(range.policyId));
    return Array.from(ids);
  }, [dateRanges]);

  const policyQueries = useQueries({
    queries: uniquePolicyIds.map((id) => ({
      queryKey: ['reservationAdvancePolicy', id],
      queryFn: () => getReservationAdvancePolicyById(id),
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

  const handleDeleteClick = (dateRange: ReservationAdvancePolicyDateRange) => {
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
      <Card title={t('reservationAdvancePolicyDateRanges.title')}>
        <Loader label={t('reservationAdvancePolicyDateRanges.table.loading')} />
      </Card>
    );
  }

  if (error) {
    const axiosError = error as any;
    let errorMessage = t('reservationAdvancePolicyDateRanges.table.error');

    if (axiosError?.response?.data?.message) {
      errorMessage = axiosError.response.data.message;
    } else if (axiosError?.message) {
      errorMessage = axiosError.message;
    }

    return (
      <Card title={t('reservationAdvancePolicyDateRanges.title')}>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      </Card>
    );
  }

  if (!dateRanges.length) {
    return (
      <Card title={t('reservationAdvancePolicyDateRanges.title')}>
        <p className="text-sm text-slate-600">
          {t('reservationAdvancePolicyDateRanges.table.empty')}
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card
        title={t('reservationAdvancePolicyDateRanges.title')}
        subtitle={t('reservationAdvancePolicyDateRanges.table.subtitle')}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('reservationAdvancePolicyDateRanges.table.policy')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('reservationAdvancePolicyDateRanges.table.dateAfter')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('reservationAdvancePolicyDateRanges.table.dateBefore')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  {t('reservationAdvancePolicyDateRanges.table.actions')}
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
                      editPath={`/reservation-advance-policy-date-ranges/edit/${dateRange.id}`}
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
        message={t('modal.delete.messageReservationAdvancePolicyDateRange')}
        confirmText={t('modal.delete.confirm')}
        cancelText={t('modal.delete.cancel')}
        variant="danger"
      />
    </>
  );
};

export default ReservationAdvancePolicyDateRangeTable;

