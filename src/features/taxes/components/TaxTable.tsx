import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueries } from '@tanstack/react-query';
import Card from '../../../components/ui/Card';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { ActionButtons } from '../../../components/ui/ActionButtons';
import Loader from '../../../components/Loader';
import { useConfirmModal } from '../../../hooks/useConfirmModal';
import { useToast } from '@/context/ToastContext';
import { getPropertyById } from '@/api/properties.api';
import { Tax } from '../types';
import { useDeleteTax } from '../hooks/useDeleteTax';

type Props = {
  taxes?: Tax[];
  isLoading?: boolean;
  error?: unknown;
};

const TaxTable: React.FC<Props> = ({ taxes = [], isLoading, error }) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const deleteMutation = useDeleteTax();
  const deleteModal = useConfirmModal();
  const [selectedTax, setSelectedTax] = useState<Tax | null>(null);

  // Get unique property IDs from taxes
  const uniquePropertyIds = useMemo(() => {
    return Array.from(new Set(taxes.map(tax => tax.propertyId).filter(Boolean)));
  }, [taxes]);

  // Fetch property names for all unique property IDs
  const propertyQueries = useQueries({
    queries: uniquePropertyIds.map((propertyId) => ({
      queryKey: ['property', propertyId],
      queryFn: () => getPropertyById(propertyId),
      enabled: !!propertyId,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    })),
  });

  // Create a map of propertyId -> property title
  const propertyMap = useMemo(() => {
    const map = new Map<string, string>();
    propertyQueries.forEach((query, index) => {
      if (query.data && uniquePropertyIds[index]) {
        map.set(uniquePropertyIds[index], query.data.title);
      }
    });
    return map;
  }, [propertyQueries, uniquePropertyIds]);

  const handleDeleteClick = (tax: Tax) => {
    setSelectedTax(tax);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTax) return;
    
    try {
      await deleteModal.handleConfirm(async () => {
        await deleteMutation.mutateAsync(selectedTax.id);
        setSelectedTax(null);
      });
      showSuccess(t('taxes.deleteSuccess', { defaultValue: 'Tax deleted successfully!' }));
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || t('common.error', { defaultValue: 'An error occurred' });
      showError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <Card title={t('taxes.title')}>
        <Loader label={t('taxes.table.loading')} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={t('taxes.title')}>
        <p className="text-sm text-red-600">{t('taxes.table.error')}</p>
      </Card>
    );
  }

  if (!taxes.length) {
    return (
      <Card title={t('taxes.title')}>
        <p className="text-sm text-slate-600">{t('taxes.table.empty')}</p>
      </Card>
    );
  }

  return (
    <>
      <Card title={t('taxes.title')} subtitle={t('taxes.table.subtitle')}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('taxes.table.title')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('taxes.table.property')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('taxes.table.logic')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('taxes.table.type')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('taxes.table.rate')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('taxes.table.inclusive')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  {t('taxes.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {taxes.map((tax) => (
                <tr key={tax.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{tax.title}</div>
                    {(tax.skipNights || tax.maxNights) && (
                      <div className="text-xs text-slate-500 mt-1">
                        {tax.skipNights && `Skip: ${tax.skipNights}n`}
                        {tax.skipNights && tax.maxNights && ' • '}
                        {tax.maxNights && `Max: ${tax.maxNights}n`}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">
                      {propertyMap.get(tax.propertyId) || (
                        <span className="text-xs font-mono text-slate-500">
                          {tax.propertyId.substring(0, 8)}...
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-900 border border-blue-200">
                      {tax.logic}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-900 border border-purple-200">
                      {tax.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-900">
                      {tax.rate}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {tax.isInclusive ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        {t('taxes.table.inclusive')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {t('taxes.table.exclusive')}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ActionButtons
                      editPath={`/taxes/edit/${tax.id}`}
                      onDelete={() => handleDeleteClick(tax)}
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
        message={t('taxes.delete.warning')}
        confirmText={t('modal.delete.confirm')}
        cancelText={t('modal.delete.cancel')}
        variant="danger"
      />
    </>
  );
};

export default TaxTable;

