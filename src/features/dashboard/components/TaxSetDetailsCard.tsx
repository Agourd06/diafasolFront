import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useChannexTaxSet } from '@/hooks/useChannexTaxSet';
import { useChannexTaxes } from '@/hooks/useChannexTax';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import TaxSetForm from '@/features/tax-sets/components/TaxSetForm';
import ChannexSyncIcon from './ChannexSyncIcon';
import type { TaxSet } from '@/features/tax-sets/types';
import type { ChannexProperty } from '@/api/channex.api';

interface TaxSetDetailsCardProps {
  taxSet: TaxSet;
  taxSetId: string;
  channexProperty: ChannexProperty | null | undefined;
  propertyExistsInChannex: boolean;
}

/**
 * Tax Set Details Card Component
 * Displays tax set information with Channex sync functionality
 */
const TaxSetDetailsCard: React.FC<TaxSetDetailsCardProps> = ({
  taxSet,
  taxSetId,
  channexProperty,
  propertyExistsInChannex,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Check if tax set exists in Channex
  const {
    existsInChannex: taxSetExistsInChannex,
    isChecking: isCheckingTaxSet,
    isSyncing: isSyncingTaxSet,
    syncToChannex: syncTaxSetToChannex,
    channexTaxes,
    syncTaxToChannex,
    isSyncingTax: isSyncingTaxToChannex,
    syncingTaxId,
  } = useChannexTaxSet({
    taxSet,
    channexPropertyId: channexProperty?.id,
    enabled: !!taxSet && !!channexProperty,
  });

  // Get all taxes in the tax set for Channex sync check
  const taxesInSet = taxSet?.taxSetTaxes?.map((tst) => tst.tax).filter(Boolean) || [];
  
  // Channex taxes sync (for checking status only)
  const {
    isTaxSynced,
    isChecking: isCheckingTaxes,
  } = useChannexTaxes(
    taxesInSet,
    channexProperty?.id,
    !!channexProperty && taxesInSet.length > 0
  );

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    // Optionally refresh the tax set data
    window.location.reload();
  };

  const handleManageTaxes = () => {
    navigate(`/tax-sets/${taxSetId}/taxes`);
  };

  const handleViewDetails = () => {
    navigate(`/tax-sets/${taxSetId}`);
  };

  // Format tax type for display
  const formatTaxType = (type: string) => {
    const typeMap: Record<string, string> = {
      tax: t('taxes.type.tax'),
      fee: t('taxes.type.fee'),
      city_tax: t('taxes.type.cityTax'),
    };
    return typeMap[type] || type;
  };

  return (
    <Card className="h-full flex flex-col bg-green-50/50 border-green-200">
      <div className="flex flex-col flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-slate-900">
              {t('context.taxSetDetails')}
            </h3>
            {propertyExistsInChannex && (
              <ChannexSyncIcon
                isChecking={isCheckingTaxSet}
                isSyncing={isSyncingTaxSet}
                existsInChannex={taxSetExistsInChannex}
                onSync={syncTaxSetToChannex}
                syncedTitle={t('context.taxSetSyncedWithChannex')}
                notSyncedTitle={t('context.taxSetNotSyncedWithChannex')}
                clickToSyncTitle={t('context.clickToSyncTaxSetChannex')}
              />
            )}
          </div>
          <button
            onClick={handleEdit}
            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
            aria-label={t('context.editTaxSet')}
            title={t('context.editTaxSet')}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-3 flex-1">
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t('context.taxSetTitle')}
              </span>
              <p className="mt-1 font-semibold text-slate-900">{taxSet.title}</p>
            </div>

            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t('context.taxSetCurrency')}
              </span>
              <p className="mt-1 font-mono font-semibold text-slate-900">{taxSet.currency}</p>
            </div>

            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t('context.taxSetStatus')}
              </span>
              <p className="mt-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    taxSet.status === 1
                      ? 'bg-green-100 text-green-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {taxSet.status === 1 ? t('taxSets.status.active') : t('taxSets.status.inactive')}
                </span>
              </p>
            </div>

            {/* Taxes List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {t('context.taxSetTaxes')}
                </span>
                <button
                  onClick={handleManageTaxes}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                >
                  {t('context.manageTaxes')}
                </button>
              </div>
              {taxSet.taxSetTaxes && taxSet.taxSetTaxes.length > 0 ? (
                <div className="space-y-2">
                  {taxSet.taxSetTaxes.slice(0, 3).map((taxSetTax) => (
                    <div
                      key={taxSetTax.taxId}
                      className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm font-medium text-slate-900">
                          {taxSetTax.tax.title}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({formatTaxType(taxSetTax.tax.type)})
                        </span>
                        {/* Channex sync icon for individual tax */}
                        {channexProperty && (
                          <div className="ml-auto">
                            {isCheckingTaxes ? (
                              <div className="h-4 w-4 rounded-sm bg-slate-200 animate-pulse" />
                            ) : syncingTaxId === taxSetTax.tax.id ? (
                              <div className="h-4 w-4 flex items-center justify-center">
                                <svg className="h-3 w-3 animate-spin text-brand-600" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                              </div>
                            ) : isTaxSynced(taxSetTax.tax.id) ? (
                              <button
                                onClick={async () => {
                                  await syncTaxToChannex(taxSetTax.tax);
                                }}
                                disabled={isSyncingTaxToChannex}
                                className="h-4 w-4 rounded-sm overflow-hidden hover:ring-2 hover:ring-brand-300 transition-all disabled:cursor-not-allowed"
                                title={t('taxes.syncedWithChannex')}
                              >
                                <img
                                  src="/group-icon.png"
                                  alt={t('taxes.syncedWithChannex')}
                                  className="h-full w-full object-cover"
                                />
                              </button>
                            ) : (
                              <button
                                onClick={async () => {
                                  await syncTaxToChannex(taxSetTax.tax);
                                }}
                                disabled={isSyncingTaxToChannex}
                                className="h-4 w-4 rounded-sm overflow-hidden hover:ring-2 hover:ring-brand-300 transition-all disabled:cursor-not-allowed"
                                title={t('taxes.clickToSyncChannex')}
                              >
                                <img
                                  src="/group-icon.png"
                                  alt={t('taxes.notSyncedWithChannex')}
                                  className="h-full w-full object-cover grayscale opacity-50 hover:opacity-75 transition-opacity"
                                />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-mono font-semibold text-slate-700 ml-2">
                        {taxSetTax.tax.logic === 'percent'
                          ? `${taxSetTax.tax.rate}%`
                          : `${taxSet.currency} ${taxSetTax.tax.rate}`}
                      </span>
                    </div>
                  ))}
                  {taxSet.taxSetTaxes.length > 3 && (
                    <p className="text-xs text-slate-500 text-center">
                      +{taxSet.taxSetTaxes.length - 3} {t('context.moreTaxes')}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-2">{t('context.noTaxesInSet')}</p>
                  <button
                    onClick={handleManageTaxes}
                    className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                  >
                    {t('context.addTaxesToSet')}
                  </button>
                </div>
              )}
            </div>
          </div>

        <Button variant="outline" onClick={handleViewDetails} className="w-full mt-auto">
          {t('context.viewTaxSetDetails')}
        </Button>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('taxSets.edit.title')}
        size="2xl"
      >
        <TaxSetForm
          taxSet={taxSet}
          onSuccess={handleEditSuccess}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </Card>
  );
};

export default TaxSetDetailsCard;
