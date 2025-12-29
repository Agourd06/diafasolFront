import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueries } from '@tanstack/react-query';
import Card from '../../../components/ui/Card';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { ActionButtons } from '../../../components/ui/ActionButtons';
import Loader from '../../../components/Loader';
import { useConfirmModal } from '../../../hooks/useConfirmModal';
import { useToast } from '@/context/ToastContext';
import { RatePlanRate } from '../types';
import { useDeleteRatePlanRate } from '../hooks/useDeleteRatePlanRate';
import { getRatePlanById } from '@/api/rate-plans.api';
import { getPropertyById } from '@/api/properties.api';

type Props = {
  ratePlanRates?: RatePlanRate[];
  isLoading?: boolean;
  error?: unknown;
};

const RatePlanRateTable: React.FC<Props> = ({ ratePlanRates = [], isLoading, error }) => {
  const { t } = useTranslation();
  const deleteMutation = useDeleteRatePlanRate();
  const deleteModal = useConfirmModal();
  const [selectedRate, setSelectedRate] = useState<RatePlanRate | null>(null);

  const uniqueRatePlanIds = useMemo(
    () => Array.from(new Set(ratePlanRates.map((r) => r.ratePlanId).filter(Boolean))),
    [ratePlanRates]
  );
  const uniquePropertyIds = useMemo(
    () => Array.from(new Set(ratePlanRates.map((r) => r.propertyId).filter(Boolean))),
    [ratePlanRates]
  );

  const ratePlanQueries = useQueries({
    queries: uniqueRatePlanIds.map((id) => ({
      queryKey: ['ratePlan', id],
      queryFn: () => getRatePlanById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const propertyQueries = useQueries({
    queries: uniquePropertyIds.map((id) => ({
      queryKey: ['property', id],
      queryFn: () => getPropertyById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const ratePlanMap = useMemo(() => {
    const map = new Map<string, string>();
    ratePlanQueries.forEach((q, idx) => {
      if (q.data && uniqueRatePlanIds[idx]) {
        map.set(uniqueRatePlanIds[idx], q.data.title);
      }
    });
    return map;
  }, [ratePlanQueries, uniqueRatePlanIds]);

  const propertyMap = useMemo(() => {
    const map = new Map<string, string>();
    propertyQueries.forEach((q, idx) => {
      if (q.data && uniquePropertyIds[idx]) {
        map.set(uniquePropertyIds[idx], q.data.title);
      }
    });
    return map;
  }, [propertyQueries, uniquePropertyIds]);

  const handleDeleteClick = (rate: RatePlanRate) => {
    setSelectedRate(rate);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRate) return;
    
    try {
      await deleteModal.handleConfirm(async () => {
        await deleteMutation.mutateAsync(selectedRate.id);
        setSelectedRate(null);
      });
      showSuccess(t('ratePlanRates.deleteSuccess', { defaultValue: 'Rate deleted successfully!' }));
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || t('common.error', { defaultValue: 'An error occurred' });
      showError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <Card title={t('ratePlanRates.title')}>
        <Loader label={t('ratePlanRates.table.loading')} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={t('ratePlanRates.title')}>
        <p className="text-sm text-red-600">{t('ratePlanRates.table.error')}</p>
      </Card>
    );
  }

  if (!ratePlanRates.length) {
    return (
      <Card title={t('ratePlanRates.title')}>
        <p className="text-sm text-slate-600">{t('ratePlanRates.table.empty')}</p>
      </Card>
    );
  }

  return (
    <>
      <Card title={t('ratePlanRates.title')} subtitle={t('ratePlanRates.table.subtitle')}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('ratePlanRates.table.property')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('ratePlanRates.table.ratePlan')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('ratePlanRates.table.date')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('ratePlanRates.table.rate')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  {t('ratePlanRates.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ratePlanRates.map((rateEntry) => (
                <tr key={rateEntry.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600">
                  <div className="font-medium text-slate-900">
                    {propertyMap.get(rateEntry.propertyId) || (
                      <span className="text-xs font-mono text-slate-500">
                        {rateEntry.propertyId.substring(0, 8)}...
                      </span>
                    )}
                  </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                  <div className="font-medium text-slate-900">
                    {ratePlanMap.get(rateEntry.ratePlanId) || (
                      <span className="text-xs font-mono text-slate-500">
                        {rateEntry.ratePlanId.substring(0, 8)}...
                      </span>
                    )}
                  </div>
                  </td>
                  <td className="px-4 py-3 text-slate-900 font-medium">
                    {new Date(rateEntry.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-slate-900 font-semibold">
                    {rateEntry.rate}
                  </td>
                  <td className="px-4 py-3">
                    <ActionButtons
                      editPath={`/rate-plans/${rateEntry.ratePlanId}/rates/edit/${rateEntry.id}`}
                      onDelete={() => handleDeleteClick(rateEntry)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteModal.isLoading}
        title={t('modal.delete.title')}
        message={t('modal.delete.message')}
        confirmText={t('modal.delete.confirm')}
        cancelText={t('modal.delete.cancel')}
        variant="danger"
      />
    </>
  );
};

export default RatePlanRateTable;

