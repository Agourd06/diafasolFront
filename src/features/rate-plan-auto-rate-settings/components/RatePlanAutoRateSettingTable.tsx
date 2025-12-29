import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueries } from '@tanstack/react-query';
import Card from '../../../components/ui/Card';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { ActionButtons } from '../../../components/ui/ActionButtons';
import Loader from '../../../components/Loader';
import { useConfirmModal } from '../../../hooks/useConfirmModal';
import { RatePlanAutoRateSetting } from '../types';
import { useDeleteRatePlanAutoRateSetting } from '../hooks/useDeleteRatePlanAutoRateSetting';
import { getRatePlanById } from '@/api/rate-plans.api';

type Props = {
  autoRateSettings?: RatePlanAutoRateSetting[];
  isLoading?: boolean;
  error?: unknown;
  ratePlanId?: string; // Optional rate plan ID for building edit paths
};

const RatePlanAutoRateSettingTable: React.FC<Props> = ({ autoRateSettings = [], isLoading, error, ratePlanId }) => {
  const { t } = useTranslation();
  const deleteMutation = useDeleteRatePlanAutoRateSetting();
  const deleteModal = useConfirmModal();
  const [selectedSetting, setSelectedSetting] = useState<RatePlanAutoRateSetting | null>(null);

  const uniqueRatePlanIds = useMemo(
    () => Array.from(new Set(autoRateSettings.map((s) => s.ratePlanId).filter(Boolean))),
    [autoRateSettings]
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

  const handleDeleteClick = (setting: RatePlanAutoRateSetting) => {
    setSelectedSetting(setting);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSetting) return;
    
    await deleteModal.handleConfirm(async () => {
      await deleteMutation.mutateAsync(selectedSetting.id);
      setSelectedSetting(null);
    });
  };

  if (isLoading) {
    return (
      <Card title={t('ratePlanAutoRateSettings.title')}>
        <Loader label={t('ratePlanAutoRateSettings.table.loading')} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={t('ratePlanAutoRateSettings.title')}>
        <p className="text-sm text-red-600">{t('ratePlanAutoRateSettings.table.error')}</p>
      </Card>
    );
  }

  if (!autoRateSettings.length) {
    return (
      <Card title={t('ratePlanAutoRateSettings.title')}>
        <p className="text-sm text-slate-600">{t('ratePlanAutoRateSettings.table.empty')}</p>
      </Card>
    );
  }

  return (
    <>
      <Card title={t('ratePlanAutoRateSettings.title')} subtitle={t('ratePlanAutoRateSettings.table.subtitle')}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('ratePlanAutoRateSettings.table.ratePlan')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('ratePlanAutoRateSettings.table.ruleName')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('ratePlanAutoRateSettings.table.ruleValue')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  {t('ratePlanAutoRateSettings.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {autoRateSettings.map((setting) => (
                <tr key={setting.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600">
                    <div className="font-medium text-slate-900">
                      {ratePlanMap.get(setting.ratePlanId) || (
                        <span className="text-xs font-mono text-slate-500">
                          {setting.ratePlanId.substring(0, 8)}...
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-mono font-medium bg-blue-50 text-blue-900 border border-blue-200">
                      {setting.ruleName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-slate-900 font-semibold">{setting.ruleValue}</span>
                  </td>
                  <td className="px-4 py-3">
                    <ActionButtons
                      editPath={ratePlanId 
                        ? `/rate-plans/${ratePlanId}/auto-rate-settings/edit/${setting.id}`
                        : `/rate-plan-auto-rate-settings/edit/${setting.id}`}
                      onDelete={() => handleDeleteClick(setting)}
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

export default RatePlanAutoRateSettingTable;

