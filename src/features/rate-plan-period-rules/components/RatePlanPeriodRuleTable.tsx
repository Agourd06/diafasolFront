import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueries } from '@tanstack/react-query';
import Card from '../../../components/ui/Card';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { ActionButtons } from '../../../components/ui/ActionButtons';
import Loader from '../../../components/Loader';
import { useConfirmModal } from '../../../hooks/useConfirmModal';
import { RatePlanPeriodRule } from '../types';
import { useDeleteRatePlanPeriodRule } from '../hooks/useDeleteRatePlanPeriodRule';
import { getRatePlanById } from '@/api/rate-plans.api';

type Props = {
  periodRules?: RatePlanPeriodRule[];
  isLoading?: boolean;
  error?: unknown;
  ratePlanId?: string; // Optional rate plan ID for building edit paths
};

const RatePlanPeriodRuleTable: React.FC<Props> = ({ periodRules = [], isLoading, error, ratePlanId }) => {
  const { t } = useTranslation();
  const deleteMutation = useDeleteRatePlanPeriodRule();
  const deleteModal = useConfirmModal();
  const [selectedRule, setSelectedRule] = useState<RatePlanPeriodRule | null>(null);

  const uniqueRatePlanIds = useMemo(
    () => Array.from(new Set(periodRules.map((rule) => rule.ratePlanId).filter(Boolean))),
    [periodRules]
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

  const handleDeleteClick = (rule: RatePlanPeriodRule) => {
    setSelectedRule(rule);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRule) return;
    
    await deleteModal.handleConfirm(async () => {
      await deleteMutation.mutateAsync(selectedRule.id);
      setSelectedRule(null);
    });
  };

  if (isLoading) {
    return (
      <Card title={t('ratePlanPeriodRules.title')}>
        <Loader label={t('ratePlanPeriodRules.table.loading')} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={t('ratePlanPeriodRules.title')}>
        <p className="text-sm text-red-600">{t('ratePlanPeriodRules.table.error')}</p>
      </Card>
    );
  }

  if (!periodRules.length) {
    return (
      <Card title={t('ratePlanPeriodRules.title')}>
        <p className="text-sm text-slate-600">{t('ratePlanPeriodRules.table.empty')}</p>
      </Card>
    );
  }

  return (
    <>
      <Card title={t('ratePlanPeriodRules.title')} subtitle={t('ratePlanPeriodRules.table.subtitle')}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('ratePlanPeriodRules.table.ratePlan')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('ratePlanPeriodRules.table.dateRange')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('ratePlanPeriodRules.table.maxStay')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('ratePlanPeriodRules.table.minStayArrival')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('ratePlanPeriodRules.table.minStayThrough')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('ratePlanPeriodRules.table.restrictions')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  {t('ratePlanPeriodRules.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {periodRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600">
                    <div className="font-medium text-slate-900">
                      {ratePlanMap.get(rule.ratePlanId) || (
                        <span className="text-xs font-mono text-slate-500">
                          {rule.ratePlanId.substring(0, 8)}...
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <div className="font-medium text-slate-900">
                        {new Date(rule.startDate).toLocaleDateString()}
                      </div>
                      <div className="text-slate-500">
                        → {new Date(rule.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-900">
                    {rule.maxStay !== null ? (
                      <span className="font-semibold">{rule.maxStay}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-900">
                    {rule.minStayArrival !== null ? (
                      <span className="font-semibold">{rule.minStayArrival}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-900">
                    {rule.minStayThrough !== null ? (
                      <span className="font-semibold">{rule.minStayThrough}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {rule.closedToArrival && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          CTA
                        </span>
                      )}
                      {rule.closedToDeparture && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          CTD
                        </span>
                      )}
                      {rule.stopSell && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          Stop
                        </span>
                      )}
                      {!rule.closedToArrival && !rule.closedToDeparture && !rule.stopSell && (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ActionButtons
                      editPath={ratePlanId 
                        ? `/rate-plans/${ratePlanId}/period-rules/edit/${rule.id}`
                        : `/rate-plan-period-rules/edit/${rule.id}`}
                      onDelete={() => handleDeleteClick(rule)}
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

export default RatePlanPeriodRuleTable;

