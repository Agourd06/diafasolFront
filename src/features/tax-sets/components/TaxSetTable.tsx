import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import Card from '../../../components/ui/Card';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import DropdownMenu from '../../../components/ui/DropdownMenu';
import Loader from '../../../components/Loader';
import { useConfirmModal } from '../../../hooks/useConfirmModal';
import { useToast } from '@/context/ToastContext';
import { TaxSet } from '../types';
import { useDeleteTaxSet } from '../hooks/useDeleteTaxSet';
import { getPropertyById } from '@/api/properties.api';

type Props = {
  taxSets?: TaxSet[];
  isLoading?: boolean;
  error?: unknown;
};

const TaxSetTable: React.FC<Props> = ({ taxSets = [], isLoading, error }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const deleteMutation = useDeleteTaxSet();
  const deleteModal = useConfirmModal();
  const [selectedTaxSet, setSelectedTaxSet] = useState<TaxSet | null>(null);

  const uniquePropertyIds = useMemo(
    () => Array.from(new Set(taxSets.map((ts) => ts.propertyId).filter(Boolean))),
    [taxSets]
  );

  const propertyQueries = useQueries({
    queries: uniquePropertyIds.map((id) => ({
      queryKey: ['property', id],
      queryFn: () => getPropertyById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const propertyMap = useMemo(() => {
    const map = new Map<string, string>();
    propertyQueries.forEach((q, idx) => {
      if (q.data && uniquePropertyIds[idx]) {
        map.set(uniquePropertyIds[idx], q.data.title);
      }
    });
    return map;
  }, [propertyQueries, uniquePropertyIds]);

  const handleDeleteClick = (taxSet: TaxSet) => {
    setSelectedTaxSet(taxSet);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTaxSet) return;
    
    try {
      await deleteModal.handleConfirm(async () => {
        await deleteMutation.mutateAsync(selectedTaxSet.id);
        setSelectedTaxSet(null);
      });
      showSuccess(t('taxSets.deleteSuccess', { defaultValue: 'Tax set deleted successfully!' }));
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || t('common.error', { defaultValue: 'An error occurred' });
      showError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <Card title={t('taxSets.title')}>
        <Loader label={t('taxSets.table.loading')} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={t('taxSets.title')}>
        <p className="text-sm text-red-600">{t('taxSets.table.error')}</p>
      </Card>
    );
  }

  if (taxSets.length === 0) {
    return (
      <Card title={t('taxSets.title')} subtitle={t('taxSets.table.subtitle')}>
        <p className="text-sm text-slate-600 text-center py-8">
          {t('taxSets.table.empty')}
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card title={t('taxSets.title')} subtitle={t('taxSets.table.subtitle')}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('taxSets.table.title')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('taxSets.table.property')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('taxSets.table.currency')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('taxSets.table.status')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  {t('taxSets.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {taxSets.map((taxSet) => (
                <tr key={taxSet.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/tax-sets/${taxSet.id}`)}
                      className="font-medium text-slate-900 hover:text-brand-600 transition-colors text-left"
                    >
                      {taxSet.title}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div className="font-medium text-slate-900">
                      {propertyMap.get(taxSet.propertyId) || taxSet.property?.title || (
                        <span className="text-xs text-slate-500 font-mono">
                          {taxSet.propertyId.substring(0, 8)}...
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="font-mono font-semibold">{taxSet.currency}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        taxSet.status === 1
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {taxSet.status === 1 ? t('taxSets.status.active') : t('taxSets.status.inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <DropdownMenu
                        trigger={
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        }
                        items={[
                          {
                            label: t('taxSets.actions.overview'),
                            icon: (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            ),
                            onClick: () => navigate(`/tax-sets/${taxSet.id}`),
                          },
                          {
                            label: t('taxSets.actions.items'),
                            icon: (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            ),
                            onClick: () => navigate(`/tax-sets/${taxSet.id}/items`),
                          },
                          { divider: true } as const,
                          {
                            label: t('common.edit'),
                            icon: (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            ),
                            onClick: () => navigate(`/tax-sets/edit/${taxSet.id}`),
                          },
                          {
                            label: t('common.delete'),
                            icon: (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            ),
                            onClick: () => handleDeleteClick(taxSet),
                          },
                        ]}
                        align="right"
                      />
                    </div>
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
          selectedTaxSet
            ? t('modal.delete.messageTaxSet', { name: selectedTaxSet.title })
            : t('modal.delete.message')
        }
        confirmText={t('modal.delete.confirm')}
        cancelText={t('modal.delete.cancel')}
        variant="danger"
      />
    </>
  );
};

export default TaxSetTable;

