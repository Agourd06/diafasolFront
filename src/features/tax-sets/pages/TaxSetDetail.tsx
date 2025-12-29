import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Breadcrumb, { BreadcrumbItem } from '../../../components/ui/Breadcrumb';
import Tabs, { Tab } from '../../../components/ui/Tabs';
import Modal from '../../../components/ui/Modal';
import Loader from '../../../components/Loader';
import { useTaxSet } from '../hooks/useTaxSet';
import { usePropertyById } from '../../properties/hooks/usePropertyById';
import { useTaxesByProperty } from '../../taxes/hooks/useTaxesByProperty';
import { useUpdateTaxSet } from '../hooks/useUpdateTaxSet';
import { useChannexProperty } from '../../../hooks/useChannexProperty';
import { useChannexTaxSet } from '../../../hooks/useChannexTaxSet';
import ChannexSyncIcon from '../../dashboard/components/ChannexSyncIcon';
import TaxForm from '../../taxes/components/TaxForm';
import type { TaxSetTax, TaxReference } from '../types';
import type { Tax } from '../../taxes/types';

const TaxSetDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const getActiveTabFromUrl = () => {
    const path = location.pathname;
    if (path.includes('/taxes')) return 'taxes';
    return 'overview';
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTabFromUrl());
  const [isAddingTax, setIsAddingTax] = useState(false);
  const [selectedTaxId, setSelectedTaxId] = useState<string>('');
  const [isCreatingNewTax, setIsCreatingNewTax] = useState(false);
  
  // Track which tax level is being updated (for loading indicator)
  const [updatingLevelTaxId, setUpdatingLevelTaxId] = useState<string | null>(null);
  // Local state for level values (to show immediate feedback)
  const [localLevels, setLocalLevels] = useState<Record<string, number>>({});
  // Debounce timer ref
  const debounceTimerRef = useRef<Record<string, NodeJS.Timeout>>({});
  
  useEffect(() => {
    setActiveTab(getActiveTabFromUrl());
  }, [location.pathname]);

  const { data: taxSet, isLoading: taxSetLoading, refetch } = useTaxSet(id!);
  const { data: property } = usePropertyById(taxSet?.propertyId || '');
  const { data: availableTaxes } = useTaxesByProperty(taxSet?.propertyId || '');
  const updateTaxSet = useUpdateTaxSet();

  // Channex property check (needed to get Channex property ID for tax sync)
  const { channexProperty, existsInChannex: propertyExistsInChannex } = useChannexProperty({
    property: property || null,
    enabled: !!property,
  });

  // Channex tax set sync
  const {
    existsInChannex: taxSetExistsInChannex,
    isChecking: isCheckingTaxSet,
    isSyncing: isSyncingTaxSet,
    syncToChannex: syncTaxSetToChannex,
    syncTaxToChannex,
    channexTaxes,
  } = useChannexTaxSet({
    taxSet: taxSet || null,
    channexPropertyId: channexProperty?.id,
    enabled: !!taxSet && !!channexProperty,
  });


  // Get taxes that are not already in the tax set
  const taxesNotInSet = availableTaxes?.filter(
    (tax) => !taxSet?.taxSetTaxes?.some((tst) => tst.taxId === tax.id)
  ) || [];
  
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'overview') {
      navigate(`/tax-sets/${id}`);
    } else {
      navigate(`/tax-sets/${id}/${tabId}`);
    }
  };

  const handleAddTax = async (taxId?: string) => {
    const taxIdToAdd = taxId || selectedTaxId;
    if (!taxIdToAdd || !taxSet) return;
    
    // If called from button click without taxId, use selectedTaxId
    if (!taxId && !selectedTaxId) return;

    const selectedTax = availableTaxes?.find(t => t.id === taxIdToAdd);
    
    // If tax doesn't exist in Channex and property exists in Channex, sync it first
    if (selectedTax && channexProperty && !channexTaxes.has(taxIdToAdd)) {
      try {
        await syncTaxToChannex(selectedTax);
      } catch (error) {
        console.error('Failed to sync tax to Channex:', error);
        // Continue with adding tax even if sync fails
      }
    }

    const currentTaxes: TaxReference[] = taxSet.taxSetTaxes?.map((tst) => ({
      id: tst.taxId,
      level: tst.level,
    })) || [];

    const newLevel = currentTaxes.length > 0 
      ? Math.max(...currentTaxes.map(t => t.level || 0)) + 1 
      : 0;

    await updateTaxSet.mutateAsync({
      id: taxSet.id,
      payload: {
        taxes: [...currentTaxes, { id: taxIdToAdd, level: newLevel }],
      },
    });

    setSelectedTaxId('');
    setIsAddingTax(false);
    refetch();
  };

  const handleTaxCreated = async (newTax?: Tax) => {
    // Close the create tax modal
    setIsCreatingNewTax(false);
    
    // Automatically add the newly created tax to the tax set
    if (newTax && taxSet) {
      // Refetch to get updated tax set and available taxes
      await refetch();
      
      // Add the newly created tax to the tax set
      // Use a small delay to ensure the tax is available in the system
      setTimeout(async () => {
        try {
          await handleAddTax(newTax.id);
        } catch (error) {
          console.error('Failed to add newly created tax to tax set:', error);
        }
      }, 300);
    }
  };

  const handleCloseCreateTax = () => {
    setIsCreatingNewTax(false);
  };

  const handleRemoveTax = async (taxId: string) => {
    if (!taxSet) return;

    const updatedTaxes: TaxReference[] = taxSet.taxSetTaxes
      ?.filter((tst) => tst.taxId !== taxId)
      .map((tst) => ({
        id: tst.taxId,
        level: tst.level,
      })) || [];

    await updateTaxSet.mutateAsync({
      id: taxSet.id,
      payload: { taxes: updatedTaxes },
    });

    refetch();
  };

  // Debounced level update to prevent spamming
  const handleUpdateLevel = useCallback((taxId: string, newLevel: number) => {
    if (!taxSet) return;

    // Update local state immediately for responsive UI
    setLocalLevels((prev) => ({ ...prev, [taxId]: newLevel }));

    // Clear existing timer for this tax
    if (debounceTimerRef.current[taxId]) {
      clearTimeout(debounceTimerRef.current[taxId]);
    }

    // Set new debounced timer (500ms delay)
    debounceTimerRef.current[taxId] = setTimeout(async () => {
      setUpdatingLevelTaxId(taxId);

      try {
        // Get the latest local levels for all taxes
        const updatedTaxes: TaxReference[] = taxSet.taxSetTaxes?.map((tst) => ({
          id: tst.taxId,
          level: tst.taxId === taxId ? newLevel : (localLevels[tst.taxId] ?? tst.level),
        })) || [];

        await updateTaxSet.mutateAsync({
          id: taxSet.id,
          payload: { taxes: updatedTaxes },
        });

        refetch();
      } finally {
        setUpdatingLevelTaxId(null);
        // Clean up the timer reference
        delete debounceTimerRef.current[taxId];
      }
    }, 500);
  }, [taxSet, localLevels, updateTaxSet, refetch]);

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimerRef.current).forEach(clearTimeout);
    };
  }, []);

  if (taxSetLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <Loader label={t('common.loading')} />
        </Card>
      </div>
    );
  }

  if (!taxSet) {
    return (
      <div className="space-y-4">
        <Card>
          <p className="text-sm text-red-600">{t('taxSets.edit.notFound')}</p>
        </Card>
      </div>
    );
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: t('nav.dashboard'), path: '/dashboard' },
    { label: taxSet.title },
  ];

  const taxCount = taxSet.taxSetTaxes?.length || 0;

  const tabs: Tab[] = [
    {
      id: 'overview',
      label: t('taxSets.tabs.overview'),
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      id: 'taxes',
      label: t('taxSets.tabs.taxes'),
      count: taxCount,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
        </svg>
      ),
    },
  ];

  const formatTaxLogic = (logic: string) => {
    const logicMap: Record<string, string> = {
      percent: t('taxes.logic.percent'),
      per_room: t('taxes.logic.perRoom'),
      per_room_per_night: t('taxes.logic.perRoomPerNight'),
      per_person: t('taxes.logic.perPerson'),
      per_person_per_night: t('taxes.logic.perPersonPerNight'),
      per_night: t('taxes.logic.perNight'),
      per_booking: t('taxes.logic.perBooking'),
    };
    return logicMap[logic] || logic;
  };

  const formatTaxType = (type: string) => {
    const typeMap: Record<string, string> = {
      tax: t('taxes.type.tax'),
      fee: t('taxes.type.fee'),
      city_tax: t('taxes.type.cityTax'),
    };
    return typeMap[type] || type;
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  {t('taxSets.overview.basicInfo')}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {t('taxSets.details.title')}
                    </label>
                    <p className="mt-1 text-base font-semibold text-slate-900">{taxSet.title}</p>
                  </div>
                  {property && (
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {t('taxSets.table.property')}
                      </label>
                      <p className="mt-1 text-base text-slate-700">{property.title}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {t('taxSets.details.currency')}
                    </label>
                    <p className="mt-1 text-base font-mono font-semibold text-slate-900">{taxSet.currency}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {t('taxSets.details.status')}
                    </label>
                    <p className="mt-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          taxSet.status === 1
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {taxSet.status === 1 ? t('taxSets.status.active') : t('taxSets.status.inactive')}
                      </span>
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  {t('taxSets.overview.quickStats')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-brand-600">
                      {taxCount}
                    </div>
                    <div className="text-sm text-slate-600">{t('taxSets.overview.taxes')}</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );
      case 'taxes':
        return (
          <div className="space-y-4">
            <div className="flex justify-end">
              {isAddingTax ? (
                <div className="space-y-2">
                  {taxesNotInSet.length === 0 ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                      <p className="text-sm text-blue-800">
                        {t('taxSets.allTaxesAdded')}
                      </p>
                      <Button
                        onClick={() => setIsCreatingNewTax(true)}
                        variant="outline"
                      >
                        {t('taxSets.createNewTax')}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedTaxId}
                        onChange={(e) => setSelectedTaxId(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      >
                        <option value="">{t('taxSets.selectTax')}</option>
                        {taxesNotInSet.map((tax) => (
                          <option key={tax.id} value={tax.id}>
                            {tax.title} ({tax.rate}% - {formatTaxType(tax.type)})
                          </option>
                        ))}
                      </select>
                      <Button
                        onClick={() => handleAddTax()}
                        disabled={!selectedTaxId || updateTaxSet.isPending}
                        isLoading={updateTaxSet.isPending}
                      >
                        {t('common.add')}
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddingTax(false)}>
                        {t('common.cancel')}
                      </Button>
                    </div>
                  )}
                  <Button variant="outline" onClick={() => setIsAddingTax(false)} className="mt-2">
                    {t('common.close')}
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsAddingTax(true)} >
                  {t('taxSets.addTax')}
                </Button>
              )}
            </div>

            {/* No available taxes message */}
            {taxesNotInSet.length === 0 && (!taxSet.taxSetTaxes || taxSet.taxSetTaxes.length === 0) && (
              <Card className="border-amber-200 bg-amber-50 mb-4">
                <div className="flex items-start gap-3 p-4">
                  <svg className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">
                      {t('taxSets.noAvailableTaxes')}
                    </h4>
                    <p className="text-sm text-amber-800 mb-3">
                      {t('taxSets.createTaxFirst')}
                    </p>
                    <Link to={`/taxes/create?propertyId=${taxSet.propertyId}&returnTo=/tax-sets/${id}/taxes`}>
                      <Button>
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {t('taxes.addTax')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )}

            {taxSet.taxSetTaxes && taxSet.taxSetTaxes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {taxSet.taxSetTaxes
                  .sort((a, b) => a.level - b.level)
                  .map((taxSetTax: TaxSetTax) => (
                    <Card key={taxSetTax.taxId} className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-slate-900 mb-1">
                            {taxSetTax.tax.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                              {formatTaxType(taxSetTax.tax.type)}
                            </span>
                            <span className="text-xs text-slate-600">
                              {formatTaxLogic(taxSetTax.tax.logic)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-500">{t('taxes.table.rate')}</span>
                          <span className="text-sm font-mono font-semibold text-slate-900">
                            {taxSetTax.tax.logic === 'percent' 
                              ? `${taxSetTax.tax.rate}%` 
                              : `${taxSet.currency} ${taxSetTax.tax.rate}`}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-500">{t('taxSets.table.level')}</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={localLevels[taxSetTax.taxId] ?? taxSetTax.level}
                              onChange={(e) => handleUpdateLevel(taxSetTax.taxId, parseInt(e.target.value) || 0)}
                              disabled={updatingLevelTaxId === taxSetTax.taxId}
                              className={`w-16 px-2 py-1 border rounded text-sm text-center focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                                updatingLevelTaxId === taxSetTax.taxId 
                                  ? 'border-brand-300 bg-slate-50 text-slate-400' 
                                  : 'border-slate-300'
                              }`}
                            />
                            {updatingLevelTaxId === taxSetTax.taxId && (
                              <svg className="h-4 w-4 animate-spin text-brand-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-500">{t('taxes.table.inclusive')}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            taxSetTax.tax.isInclusive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            {taxSetTax.tax.isInclusive ? t('common.yes') : t('common.no')}
                          </span>
                        </div>
                        
                        <div className="pt-2 border-t border-slate-200">
                          <button
                            onClick={() => handleRemoveTax(taxSetTax.taxId)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium w-full text-center"
                            disabled={updateTaxSet.isPending}
                          >
                            {t('common.remove')}
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            ) : taxesNotInSet.length > 0 ? (
              <Card>
                <p className="text-sm text-slate-600 text-center py-8">
                  {t('taxSets.noTaxes')}
                </p>
                <div className="flex justify-center pb-4">
                  <Button variant="outline" onClick={() => setIsAddingTax(true)}>
                    {t('taxSets.addTax')}
                  </Button>
                </div>
              </Card>
            ) : null}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{taxSet.title}</h1>
            <p className="text-sm text-slate-600">
              {t('taxSets.detail.subtitle')}
            </p>
          </div>
          {propertyExistsInChannex && channexProperty && (
            <ChannexSyncIcon
              isChecking={isCheckingTaxSet}
              isSyncing={isSyncingTaxSet}
              existsInChannex={taxSetExistsInChannex}
              onSync={syncTaxSetToChannex}
              syncedTitle={t('taxSets.syncedWithChannex')}
              notSyncedTitle={t('taxSets.notSyncedWithChannex')}
              clickToSyncTitle={t('taxSets.clickToSyncChannex')}
            />
          )}
        </div>
        <div className="flex gap-2">
          <Link to={`/tax-sets/edit/${id}`}>
            <Button variant="outline">{t('common.edit')}</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost">{t('common.back')}</Button>
          </Link>
        </div>
      </div>
      <Card className="p-0">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
        <div className="p-6">
          {getTabContent()}
        </div>
      </Card>

      {/* Create New Tax Modal */}
      {isCreatingNewTax && taxSet && (
        <Modal
          isOpen={isCreatingNewTax}
          onClose={handleCloseCreateTax}
          title={t('taxes.create.title')}
          size="2xl"
        >
          <TaxForm
            defaultPropertyId={taxSet.propertyId}
            onSuccess={handleTaxCreated}
            onCancel={handleCloseCreateTax}
          />
        </Modal>
      )}
    </div>
  );
};

export default TaxSetDetail;
