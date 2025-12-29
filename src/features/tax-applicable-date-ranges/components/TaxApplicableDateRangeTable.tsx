import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueries } from '@tanstack/react-query';
import Card from '../../../components/ui/Card';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { ActionButtons } from '../../../components/ui/ActionButtons';
import Loader from '../../../components/Loader';
import { useConfirmModal } from '../../../hooks/useConfirmModal';
import { getTaxById } from '@/api/taxes.api';
import { TaxApplicableDateRange } from '../types';
import { useDeleteTaxApplicableDateRange } from '../hooks/useDeleteTaxApplicableDateRange';

type Props = {
  dateRanges?: TaxApplicableDateRange[];
  isLoading?: boolean;
  error?: unknown;
};

const TaxApplicableDateRangeTable: React.FC<Props> = ({ dateRanges = [], isLoading, error }) => {
  const { t } = useTranslation();
  const deleteMutation = useDeleteTaxApplicableDateRange();
  const deleteModal = useConfirmModal();
  const [selectedRange, setSelectedRange] = useState<TaxApplicableDateRange | null>(null);

  // Get unique tax IDs from date ranges
  const uniqueTaxIds = useMemo(() => {
    return Array.from(new Set(dateRanges.map(range => range.taxId).filter(Boolean)));
  }, [dateRanges]);

  // Fetch tax names for all unique tax IDs
  const taxQueries = useQueries({
    queries: uniqueTaxIds.map((taxId) => ({
      queryKey: ['tax', taxId],
      queryFn: () => getTaxById(taxId),
      enabled: !!taxId,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    })),
  });

  // Create a map of taxId -> tax title
  const taxMap = useMemo(() => {
    const map = new Map<string, string>();
    taxQueries.forEach((query, index) => {
      if (query.data && uniqueTaxIds[index]) {
        map.set(uniqueTaxIds[index], query.data.title);
      }
    });
    return map;
  }, [taxQueries, uniqueTaxIds]);

  const handleDeleteClick = (range: TaxApplicableDateRange) => {
    setSelectedRange(range);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRange) return;
    
    await deleteModal.handleConfirm(async () => {
      await deleteMutation.mutateAsync(selectedRange.id);
      setSelectedRange(null);
    });
  };

  if (isLoading) {
    return (
      <Card title={t('taxApplicableDateRanges.title')}>
        <Loader label={t('taxApplicableDateRanges.table.loading')} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={t('taxApplicableDateRanges.title')}>
        <p className="text-sm text-red-600">{t('taxApplicableDateRanges.table.error')}</p>
      </Card>
    );
  }

  if (!dateRanges.length) {
    return (
      <Card title={t('taxApplicableDateRanges.title')}>
        <p className="text-sm text-slate-600">{t('taxApplicableDateRanges.table.empty')}</p>
      </Card>
    );
  }

  return (
    <>
      <Card title={t('taxApplicableDateRanges.title')} subtitle={t('taxApplicableDateRanges.table.subtitle')}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('taxApplicableDateRanges.table.tax')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('taxApplicableDateRanges.table.dateRange')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  {t('taxApplicableDateRanges.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dateRanges.map((range) => (
                <tr key={range.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">
                      {taxMap.get(range.taxId) || (
                        <span className="text-xs font-mono text-slate-500">
                          {range.taxId.substring(0, 8)}...
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {new Date(range.dateAfter).toLocaleDateString()}
                      </span>
                      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="font-medium text-slate-900">
                        {new Date(range.dateBefore).toLocaleDateString()}
                      </span>
                      <span className="ml-2 text-xs text-slate-500">
                        ({Math.ceil((new Date(range.dateBefore).getTime() - new Date(range.dateAfter).getTime()) / (1000 * 60 * 60 * 24))} days)
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ActionButtons
                      editPath={`/tax-applicable-date-ranges/edit/${range.id}`}
                      onDelete={() => handleDeleteClick(range)}
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

export default TaxApplicableDateRangeTable;

