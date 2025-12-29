import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Breadcrumb, { BreadcrumbItem } from '../../../components/ui/Breadcrumb';
import Tabs, { Tab } from '../../../components/ui/Tabs';
import Loader from '../../../components/Loader';
import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';
import Pagination from '../../../components/ui/Pagination';
import { useRatePlan } from '../hooks/useRatePlan';
import { usePropertyById } from '../../properties/hooks/usePropertyById';
import { useRoomTypeById } from '../../room-types/hooks/useRoomTypeById';
import RatePlanOptionTable from '../../rate-plan-options/components/RatePlanOptionTable';
import RatePlanRateTable from '../../rate-plan-rates/components/RatePlanRateTable';
import RatePlanDailyRuleTable from '../../rate-plan-daily-rules/components/RatePlanDailyRuleTable';
import RatePlanPeriodRuleTable from '../../rate-plan-period-rules/components/RatePlanPeriodRuleTable';
import RatePlanAutoRateSettingTable from '../../rate-plan-auto-rate-settings/components/RatePlanAutoRateSettingTable';
import { getOptionsByRatePlan } from '@/api/rate-plan-options.api';
import { getRatesByRatePlan } from '@/api/rate-plan-rates.api';
import { getDailyRulesByRatePlan } from '@/api/rate-plan-daily-rules.api';
import { getPeriodRulesByRatePlan } from '@/api/rate-plan-period-rules.api';
import { getAutoRateSettingsByRatePlan } from '@/api/rate-plan-auto-rate-settings.api';
import { useQuery } from '@tanstack/react-query';
import { useGenerateYearlyRates } from '@/features/rate-plan-rates/hooks/useGenerateYearlyRates';
import { useChannexRatesSync } from '@/hooks/useChannexRatesSync';
import ChannexSyncIcon from '@/features/dashboard/components/ChannexSyncIcon';
import { useToast } from '@/context/ToastContext';
import { useChannexProperty } from '@/hooks/useChannexProperty';
import { useChannexRatePlan } from '@/hooks/useChannexRatePlan';
import { useChannexRoomType } from '@/hooks/useChannexRoomType';

const RatePlanDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useToast();
  
  // Determine active tab from URL
  const getActiveTabFromUrl = () => {
    const path = location.pathname;
    if (path.includes('/options')) return 'options';
    if (path.includes('/rates')) return 'rates';
    if (path.includes('/daily-rules')) return 'daily-rules';
    if (path.includes('/period-rules')) return 'period-rules';
    if (path.includes('/auto-rate-settings')) return 'auto-rate-settings';
    return 'overview';
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTabFromUrl());
  
  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(getActiveTabFromUrl());
  }, [location.pathname]);

  const { data: ratePlan, isLoading: ratePlanLoading } = useRatePlan(id!);
  const { data: property } = usePropertyById(ratePlan?.propertyId || '');
  const { data: roomType } = useRoomTypeById(ratePlan?.roomTypeId || '');

  // Get Channex IDs for property, room type, and rate plan
  const { channexProperty } = useChannexProperty({
    property,
    enabled: !!property,
  });

  const { channexRoomType } = useChannexRoomType({
    roomType,
    channexPropertyId: channexProperty?.id,
    enabled: !!roomType && !!channexProperty,
  });

  const { channexRatePlan } = useChannexRatePlan({
    ratePlan,
    channexRoomTypeId: channexRoomType?.id,
    channexPropertyId: channexProperty?.id,
    enabled: !!ratePlan && !!channexProperty && !!channexRoomType,
  });
  
  // Fetch related data
  const { data: options, isLoading: optionsLoading } = useQuery({
    queryKey: ['ratePlanOptions', 'ratePlan', id],
    queryFn: () => getOptionsByRatePlan(id!),
    enabled: !!id,
  });

  // Rate plan rates pagination and filtering state
  const [ratesPage, setRatesPage] = useState(1);
  const [ratesLimit] = useState(10);
  const [ratesStartDate, setRatesStartDate] = useState('');
  const [ratesEndDate, setRatesEndDate] = useState('');
  const [ratesSortBy, setRatesSortBy] = useState<'date' | 'rate' | 'id'>('date');
  const [ratesSortOrder, setRatesSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  const { data: ratesData, isLoading: ratesLoading } = useQuery({
    queryKey: ['ratePlanRates', 'ratePlan', id, ratesPage, ratesLimit, ratesStartDate, ratesEndDate, ratesSortBy, ratesSortOrder],
    queryFn: () => getRatesByRatePlan(id!, {
      page: ratesPage,
      limit: ratesLimit,
      startDate: ratesStartDate || undefined,
      endDate: ratesEndDate || undefined,
      sortBy: ratesSortBy,
      sortOrder: ratesSortOrder,
    }),
    enabled: !!id,
  });

  const rates = ratesData?.data || [];
  const ratesPagination = ratesData?.meta;

  const { data: dailyRules, isLoading: dailyRulesLoading, error: dailyRulesError } = useQuery({
    queryKey: ['ratePlanDailyRules', 'ratePlan', id],
    queryFn: () => getDailyRulesByRatePlan(id!),
    enabled: !!id,
    retry: 1,
  });

  const { data: periodRules, isLoading: periodRulesLoading } = useQuery({
    queryKey: ['ratePlanPeriodRules', 'ratePlan', id],
    queryFn: () => getPeriodRulesByRatePlan(id!),
    enabled: !!id,
  });

  const { data: autoRateSettings, isLoading: autoRateSettingsLoading } = useQuery({
    queryKey: ['ratePlanAutoRateSettings', 'ratePlan', id],
    queryFn: () => getAutoRateSettingsByRatePlan(id!),
    enabled: !!id,
  });

  // Generate yearly rates mutation
  const generateRatesMutation = useGenerateYearlyRates();

  // Channex rates sync
  const {
    rangesCount,
    hasRates,
    isLoadingGroupedRates,
    isSyncing: isSyncingRates,
    syncError: ratesSyncError,
    syncToChannex: syncRatesToChannex,
    canSync: canSyncRates,
    hasChannexIds,
    syncSuccess,
    channexPropertyId: syncChannexPropertyId,
    channexRatePlanId: syncChannexRatePlanId,
  } = useChannexRatesSync({
    ratePlanId: id!,
    channexPropertyId: channexProperty?.id,
    channexRatePlanId: channexRatePlan?.id,
    enabled: !!id && activeTab === 'rates',
    dateRange: ratesStartDate || ratesEndDate ? {
      startDate: ratesStartDate || undefined,
      endDate: ratesEndDate || undefined,
    } : undefined,
  });

  // Determine why sync is disabled for better error message
  const getSyncDisabledReason = () => {
    if (!hasRates) {
      return t('ratePlanRates.sync.noRates', { defaultValue: 'No rates to sync. Please generate rates first.' });
    }
    if (rangesCount === 0) {
      return t('ratePlanRates.sync.noRanges', { defaultValue: 'No rate ranges to sync. Please generate rates first.' });
    }
    if (!hasChannexIds) {
      if (!syncChannexPropertyId) {
        return t('ratePlanRates.sync.propertyNotSynced', { defaultValue: 'Property must be synced to Channex first.' });
      }
      if (!syncChannexRatePlanId) {
        return t('ratePlanRates.sync.ratePlanNotSynced', { defaultValue: 'Rate Plan must be synced to Channex first.' });
      }
      return t('ratePlanRates.sync.missingChannexIds', { defaultValue: 'Property and Rate Plan must be synced to Channex first.' });
    }
    if (isLoadingGroupedRates) {
      return t('ratePlanRates.sync.loading', { defaultValue: 'Loading rates...' });
    }
    return '';
  };
  
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'overview') {
      navigate(`/rate-plans/${id}`);
    } else {
      navigate(`/rate-plans/${id}/${tabId}`);
    }
  };

  if (ratePlanLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <Loader label={t('common.loading')} />
        </Card>
      </div>
    );
  }

  if (!ratePlan) {
    return (
      <div className="space-y-4">
        <Card>
          <p className="text-sm text-red-600">{t('ratePlans.edit.notFound')}</p>
        </Card>
      </div>
    );
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: t('nav.dashboard'), path: '/dashboard' },
    { label: ratePlan.title },
  ];

  const tabs: Tab[] = [
    {
      id: 'overview',
      label: t('ratePlans.tabs.overview'),
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      id: 'options',
      label: t('ratePlans.tabs.options'),
      count: options?.length || 0,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: 'rates',
      label: t('ratePlans.tabs.rates'),
      count: ratesPagination?.total || rates?.length || 0,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'daily-rules',
      label: t('ratePlans.tabs.dailyRules'),
      count: dailyRules?.length || 0,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'period-rules',
      label: t('ratePlans.tabs.periodRules'),
      count: periodRules?.length || 0,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'auto-rate-settings',
      label: t('ratePlans.tabs.autoRateSettings'),
      count: autoRateSettings?.length || 0,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const getTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  {t('ratePlans.overview.basicInfo')}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {t('ratePlans.table.title')}
                    </label>
                    <p className="mt-1 text-base font-semibold text-slate-900">{ratePlan.title}</p>
                  </div>
                  {property && (
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {t('ratePlans.table.property')}
                      </label>
                      <p className="mt-1 text-base text-slate-700">{property.title}</p>
                    </div>
                  )}
                  {roomType && (
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {t('ratePlans.table.roomType')}
                      </label>
                      <p className="mt-1 text-base text-slate-700">{roomType.title}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {t('ratePlans.table.currency')}
                    </label>
                    <p className="mt-1 text-base font-mono font-semibold text-slate-900">{ratePlan.currency}</p>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  {t('ratePlans.overview.pricingInfo')}
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-500">{t('ratePlans.table.sellMode')}:</span>{' '}
                    <span className="font-semibold text-slate-700">
                      {ratePlan.sellMode === 'per_room' 
                        ? t('ratePlans.form.perRoom') 
                        : ratePlan.sellMode === 'per_person'
                        ? t('ratePlans.form.perPerson')
                        : ratePlan.sellMode}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t('ratePlans.table.rateMode')}:</span>{' '}
                    <span className="font-semibold text-slate-700">
                      {ratePlan.rateMode === 'manual'
                        ? t('ratePlans.rateMode.manual')
                        : ratePlan.rateMode === 'derived'
                        ? t('ratePlans.rateMode.derived')
                        : ratePlan.rateMode === 'auto'
                        ? t('ratePlans.rateMode.auto')
                        : ratePlan.rateMode === 'cascade'
                        ? t('ratePlans.rateMode.cascade')
                        : ratePlan.rateMode}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t('ratePlans.form.childrenFee')}:</span>{' '}
                    <span className="font-semibold text-slate-700">
                      {ratePlan.currency} {Number(ratePlan.childrenFee).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t('ratePlans.form.infantFee')}:</span>{' '}
                    <span className="font-semibold text-slate-700">
                      {ratePlan.currency} {Number(ratePlan.infantFee).toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  {t('ratePlans.overview.quickStats')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-brand-600">
                      {options?.length || 0}
                    </div>
                    <div className="text-sm text-slate-600">{t('ratePlans.overview.options')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-brand-600">
                      {ratesPagination?.total || rates?.length || 0}
                    </div>
                    <div className="text-sm text-slate-600">{t('ratePlans.overview.rates')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-brand-600">
                      {dailyRules?.length || 0}
                    </div>
                    <div className="text-sm text-slate-600">{t('ratePlans.overview.dailyRules')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-brand-600">
                      {periodRules?.length || 0}
                    </div>
                    <div className="text-sm text-slate-600">{t('ratePlans.overview.periodRules')}</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );
      case 'options':
        return (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Link to={`/rate-plans/${id}/options/create`}>
                <Button size="sm">{t('ratePlanOptions.addOption')}</Button>
              </Link>
            </div>
            {options && options.length > 0 ? (
              <RatePlanOptionTable 
                ratePlanOptions={options} 
                isLoading={optionsLoading} 
                error={undefined}
                ratePlanId={id}
              />
            ) : (
              <Card>
                <p className="text-sm text-slate-600 text-center py-8">
                  {t('ratePlanOptions.empty')}
                </p>
                <div className="flex justify-center">
                  <Link to={`/rate-plans/${id}/options/create`}>
                    <Button variant="outline">{t('ratePlanOptions.addOption')}</Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        );
      case 'rates':
        const handleGenerateYearlyRates = async () => {
          if (!id) return;
          
          const confirmed = window.confirm(
            t('ratePlanRates.generateYearly.confirm', {
              defaultValue: 'This will generate 365 days of rates starting from today. Existing rates for these dates will be updated. Continue?'
            })
          );

          if (!confirmed) return;

          try {
            const result = await generateRatesMutation.mutateAsync(id);
            // Ensure baseRate is a number before calling toFixed
            const baseRateValue = typeof result.baseRate === 'number' 
              ? result.baseRate 
              : parseFloat(String(result.baseRate || 0));
            const formattedBaseRate = isNaN(baseRateValue) ? '0.00' : baseRateValue.toFixed(2);
            
            showSuccess(
              t('ratePlanRates.generateYearly.success', {
                count: result.count,
                baseRate: formattedBaseRate,
                defaultValue: `Successfully generated ${result.count} rates with base rate $${formattedBaseRate}`
              })
            );
            // Reset to first page after generation
            setRatesPage(1);
          } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || t('ratePlanRates.generateYearly.error');
            showError(errorMessage);
          }
        };

        const handleSyncRates = async () => {
          try {
            const result = await syncRatesToChannex();
            showSuccess(
              t('ratePlanRates.sync.success', {
                ranges: result.rangesSent || rangesCount,
                defaultValue: `Successfully synced ${result.rangesSent || rangesCount} rate ranges to Channex`
              })
            );
          } catch (error: any) {
            // Error is already handled by the hook and displayed in the error section
            console.error('Sync error:', error);
          }
        };

        const handleFilterRates = () => {
          setRatesPage(1); // Reset to first page when filtering
        };

        const handleClearFilters = () => {
          setRatesStartDate('');
          setRatesEndDate('');
          setRatesPage(1);
        };

        return (
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              {/* Date Filters */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Label htmlFor="startDate" className="text-xs">
                    {t('ratePlanRates.filters.startDate', { defaultValue: 'Start Date' })}
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={ratesStartDate}
                    onChange={(e) => setRatesStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="endDate" className="text-xs">
                    {t('ratePlanRates.filters.endDate', { defaultValue: 'End Date' })}
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={ratesEndDate}
                    onChange={(e) => setRatesEndDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleFilterRates} variant="outline" size="sm">
                    {t('ratePlanRates.filters.filter', { defaultValue: 'Filter' })}
                  </Button>
                  {(ratesStartDate || ratesEndDate) && (
                    <Button onClick={handleClearFilters} variant="outline" size="sm">
                      {t('ratePlanRates.filters.clear', { defaultValue: 'Clear' })}
                    </Button>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 items-center">
                <ChannexSyncIcon
                  isChecking={isLoadingGroupedRates}
                  isSyncing={isSyncingRates}
                  existsInChannex={syncSuccess || false}
                  onSync={handleSyncRates}
                  syncedTitle={t('ratePlanRates.sync.synced', { 
                    ranges: rangesCount,
                    defaultValue: `Synced ${rangesCount} rate ranges to Channex` 
                  })}
                  notSyncedTitle={t('ratePlanRates.sync.notSynced', { 
                    defaultValue: 'Not synced to Channex. Click to sync.' 
                  })}
                  clickToSyncTitle={t('ratePlanRates.sync.clickToSync', { 
                    ranges: rangesCount,
                    defaultValue: `Click to sync ${rangesCount} rate ranges to Channex` 
                  })}
                  disabled={!canSyncRates}
                  disabledTitle={getSyncDisabledReason()}
                />
                <Button
                  onClick={handleGenerateYearlyRates}
                  disabled={generateRatesMutation.isPending}
                  variant="outline"
                >
                  {generateRatesMutation.isPending
                    ? t('ratePlanRates.generateYearly.generating', { defaultValue: 'Generating...' })
                    : t('ratePlanRates.generateYearly.button', { defaultValue: 'Generate 365 Days of Rates' })}
                </Button>
                <Link to={`/rate-plans/${id}/rates/create`}>
                  <Button size="sm">{t('ratePlanRates.addRate')}</Button>
                </Link>
              </div>
            </div>

            {/* Error Display */}
            {(generateRatesMutation.isError || ratesSyncError) && (
              <Card>
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  <div className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-red-900 mb-1">
                        {generateRatesMutation.isError
                          ? t('ratePlanRates.generateYearly.errorTitle', { defaultValue: 'Error generating rates' })
                          : t('ratePlanRates.sync.errorTitle', { defaultValue: 'Error syncing rates to Channex' })}
                      </h3>
                      <p className="text-sm text-red-700">
                        {(() => {
                          const error = (generateRatesMutation.isError ? generateRatesMutation.error : ratesSyncError) as any;
                          return error?.response?.data?.message || error?.message || 
                            (generateRatesMutation.isError 
                              ? t('ratePlanRates.generateYearly.error')
                              : t('ratePlanRates.sync.error'));
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Rates Table */}
            {rates && rates.length > 0 ? (
              <>
                <RatePlanRateTable ratePlanRates={rates} isLoading={ratesLoading} error={undefined} />
                {ratesPagination && ratesPagination.totalPages > 1 && (
                  <Card>
                    <Pagination
                      currentPage={ratesPagination.page || 1}
                      totalPages={ratesPagination.totalPages || 1}
                      onPageChange={setRatesPage}
                      itemsPerPage={ratesPagination.limit || ratesLimit}
                      totalItems={ratesPagination.total || 0}
                      currentItemsCount={rates.length}
                    />
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <p className="text-sm text-slate-600 text-center py-8">
                  {ratesStartDate || ratesEndDate
                    ? t('ratePlanRates.emptyFiltered', { defaultValue: 'No rates found for the selected date range' })
                    : t('ratePlanRates.empty')}
                </p>
                {!(ratesStartDate || ratesEndDate) && (
                  <div className="flex justify-center gap-2">
                    <Button
                      onClick={handleGenerateYearlyRates}
                      disabled={generateRatesMutation.isPending}
                      variant="outline"
                    >
                      {generateRatesMutation.isPending
                        ? t('ratePlanRates.generateYearly.generating', { defaultValue: 'Generating...' })
                        : t('ratePlanRates.generateYearly.button', { defaultValue: 'Generate 365 Days of Rates' })}
                    </Button>
                    <Link to={`/rate-plans/${id}/rates/create`}>
                      <Button variant="outline">{t('ratePlanRates.addRate')}</Button>
                    </Link>
                  </div>
                )}
              </Card>
            )}
          </div>
        );
      case 'daily-rules':
        return (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Link to={`/rate-plans/${id}/daily-rules/create`}>
                <Button size="sm">{t('ratePlanDailyRules.addRule')}</Button>
              </Link>
            </div>
            {dailyRulesError ? (
              <Card>
                <p className="text-sm text-red-600">
                  {t('ratePlanDailyRules.table.error')}: {dailyRulesError instanceof Error ? dailyRulesError.message : String(dailyRulesError)}
                </p>
              </Card>
            ) : dailyRules && dailyRules.length > 0 ? (
              <RatePlanDailyRuleTable dailyRules={dailyRules} isLoading={dailyRulesLoading} error={dailyRulesError} />
            ) : (
              <Card>
                <p className="text-sm text-slate-600 text-center py-8">
                  {t('ratePlanDailyRules.empty')}
                </p>
                <div className="flex justify-center">
                  <Link to={`/rate-plans/${id}/daily-rules/create`}>
                    <Button variant="outline">{t('ratePlanDailyRules.addRule')}</Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        );
      case 'period-rules':
        return (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Link to={`/rate-plans/${id}/period-rules/create`}>
                <Button type="button" size="sm">{t('ratePlanPeriodRules.addRule')}</Button>
              </Link>
            </div>
            {periodRules && periodRules.length > 0 ? (
              <RatePlanPeriodRuleTable periodRules={periodRules} isLoading={periodRulesLoading} error={undefined} ratePlanId={id} />
            ) : (
              <Card>
                <p className="text-sm text-slate-600 text-center py-8">
                  {t('ratePlanPeriodRules.empty')}
                </p>
                <div className="flex justify-center">
                  <Link to={`/rate-plans/${id}/period-rules/create`}>
                    <Button type="button" variant="outline">{t('ratePlanPeriodRules.addRule')}</Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        );
      case 'auto-rate-settings':
        return (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Link to={`/rate-plans/${id}/auto-rate-settings/create`}>
                <Button type="button" size="sm">{t('ratePlanAutoRateSettings.addSetting')}</Button>
              </Link>
            </div>
            {autoRateSettings && autoRateSettings.length > 0 ? (
              <RatePlanAutoRateSettingTable autoRateSettings={autoRateSettings} isLoading={autoRateSettingsLoading} error={undefined} ratePlanId={id} />
            ) : (
              <Card>
                <p className="text-sm text-slate-600 text-center py-8">
                  {t('ratePlanAutoRateSettings.empty')}
                </p>
                <div className="flex justify-center">
                  <Link to={`/rate-plans/${id}/auto-rate-settings/create`}>
                    <Button type="button" variant="outline">{t('ratePlanAutoRateSettings.addSetting')}</Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{ratePlan.title}</h1>
          <p className="text-sm text-slate-600">
            {t('ratePlans.detail.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/rate-plans/edit/${id}`}>
            <Button variant="outline">{t('common.edit')}</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline">{t('common.back')}</Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Card className="p-0">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
        <div className="p-6">
          {getTabContent()}
        </div>
      </Card>
    </div>
  );
};

export default RatePlanDetail;

