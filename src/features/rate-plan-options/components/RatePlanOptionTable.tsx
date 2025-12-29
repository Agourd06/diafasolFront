import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueries } from '@tanstack/react-query';
import Card from '../../../components/ui/Card';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { ActionButtons } from '../../../components/ui/ActionButtons';
import Loader from '../../../components/Loader';
import { useConfirmModal } from '../../../hooks/useConfirmModal';
import { useToast } from '@/context/ToastContext';
import { RatePlanOption } from '../types';
import { useDeleteRatePlanOption } from '../hooks/useDeleteRatePlanOption';
import { getRatePlanById } from '@/api/rate-plans.api';

type Props = {
  ratePlanOptions?: RatePlanOption[];
  isLoading?: boolean;
  error?: unknown;
  ratePlanId?: string; // Optional rate plan ID for nested routes
};

const RatePlanOptionTable: React.FC<Props> = ({ ratePlanOptions = [], isLoading, error, ratePlanId }) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const deleteMutation = useDeleteRatePlanOption();
  const deleteModal = useConfirmModal();
  const [selectedOption, setSelectedOption] = useState<RatePlanOption | null>(null);

  const uniqueRatePlanIds = useMemo(
    () => Array.from(new Set(ratePlanOptions.map((opt) => opt.ratePlanId).filter(Boolean))),
    [ratePlanOptions]
  );

  const ratePlanQueries = useQueries({
    queries: uniqueRatePlanIds.map((id) => ({
      queryKey: ['ratePlan', id],
      queryFn: () => getRatePlanById(id),
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

  const handleDeleteClick = (option: RatePlanOption) => {
    setSelectedOption(option);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOption) return;
    
    try {
      await deleteModal.handleConfirm(async () => {
        await deleteMutation.mutateAsync(selectedOption.id);
        setSelectedOption(null);
      });
      showSuccess(t('ratePlanOptions.deleteSuccess', { defaultValue: 'Option deleted successfully!' }));
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || t('common.error', { defaultValue: 'An error occurred' });
      showError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <Card title={t('ratePlanOptions.title')}>
        <Loader label={t('ratePlanOptions.table.loading')} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={t('ratePlanOptions.title')}>
        <p className="text-sm text-red-600">{t('ratePlanOptions.table.error')}</p>
      </Card>
    );
  }

  if (!ratePlanOptions.length) {
    return (
      <Card title={t('ratePlanOptions.title')}>
        <p className="text-sm text-slate-600">{t('ratePlanOptions.table.empty')}</p>
      </Card>
    );
  }

  return (
    <>
      <Card title={t('ratePlanOptions.title')} subtitle={t('ratePlanOptions.table.subtitle')}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('ratePlanOptions.table.ratePlan')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('ratePlanOptions.table.occupancy')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('ratePlanOptions.table.rate')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('ratePlanOptions.table.isPrimary')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  {t('ratePlanOptions.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ratePlanOptions.map((option) => (
                <tr key={option.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600">
                  <div className="font-medium text-slate-900">
                    {ratePlanMap.get(option.ratePlanId) || (
                      <span className="text-xs font-mono text-slate-500">
                        {option.ratePlanId.substring(0, 8)}...
                      </span>
                    )}
                  </div>
                  </td>
                  <td className="px-4 py-3 text-slate-900 font-semibold">
                    {option.occupancy}
                  </td>
                  <td className="px-4 py-3 text-slate-900 font-semibold">
                    {option.rate}
                  </td>
                  <td className="px-4 py-3">
                    {option.isPrimary ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {t('ratePlanOptions.table.primary')}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ActionButtons
                      editPath={ratePlanId
                        ? `/rate-plans/${ratePlanId}/options/edit/${option.id}`
                        : `/rate-plan-options/edit/${option.id}`}
                      onDelete={() => handleDeleteClick(option)}
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

export default RatePlanOptionTable;

