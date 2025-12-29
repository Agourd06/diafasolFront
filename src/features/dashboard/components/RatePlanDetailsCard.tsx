import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useChannexRatePlan } from '@/hooks/useChannexRatePlan';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ChannexSyncIcon from './ChannexSyncIcon';
import type { RatePlan } from '@/features/rate-plans/types';
import type { ChannexProperty } from '@/api/channex.api';
import type { ChannexRoomType } from '@/api/channex.api';

interface RatePlanDetailsCardProps {
  ratePlan: RatePlan;
  ratePlanId: string;
  channexProperty: ChannexProperty | null | undefined;
  channexRoomType: ChannexRoomType | null | undefined;
  propertyExistsInChannex: boolean;
  roomTypeExistsInChannex: boolean;
}

/**
 * Rate Plan Details Card Component
 * Displays rate plan information with Channex sync functionality
 */
const RatePlanDetailsCard: React.FC<RatePlanDetailsCardProps> = ({
  ratePlan,
  ratePlanId,
  channexProperty,
  channexRoomType,
  propertyExistsInChannex,
  roomTypeExistsInChannex,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Check if rate plan exists in Channex
  const {
    existsInChannex: ratePlanExistsInChannex,
    isChecking: isCheckingRatePlan,
    isSyncing: isSyncingRatePlan,
    syncToChannex: syncRatePlanToChannex,
    hasOptions,
    isMissingOptions,
    isLoadingOptions,
    syncError,
  } = useChannexRatePlan({
    ratePlan,
    channexRoomTypeId: channexRoomType?.id,
    channexPropertyId: channexProperty?.id,
    enabled: !!ratePlan && !!channexProperty && !!channexRoomType,
  });

  const handleEdit = () => {
    navigate(`/rate-plans/edit/${ratePlanId}`);
  };

  const handleViewDetails = () => {
    navigate(`/rate-plans/${ratePlanId}`);
  };

  // Format sell mode for display
  const formatSellMode = (sellMode: string) => {
    const modeMap: Record<string, string> = {
      per_room: t('ratePlans.form.perRoom'),
      per_person: t('ratePlans.form.perPerson'),
    };
    return modeMap[sellMode] || sellMode;
  };

  // Format rate mode for display
  const formatRateMode = (rateMode: string) => {
    const modeMap: Record<string, string> = {
      manual: t('ratePlans.rateMode.manual') || 'Manual',
      derived: t('ratePlans.rateMode.derived') || 'Derived',
      auto: t('ratePlans.rateMode.auto') || 'Auto',
      cascade: t('ratePlans.rateMode.cascade') || 'Cascade',
    };
    return modeMap[rateMode] || rateMode;
  };

  return (
    <Card className="h-full flex flex-col bg-yellow-50/50 border-yellow-200">
      <div className="flex flex-col flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-slate-900">
              {t('context.ratePlanDetails')}
            </h3>
            {propertyExistsInChannex && roomTypeExistsInChannex && (
              <ChannexSyncIcon
                isChecking={isCheckingRatePlan || isLoadingOptions}
                isSyncing={isSyncingRatePlan}
                existsInChannex={ratePlanExistsInChannex}
                onSync={syncRatePlanToChannex}
                syncedTitle={t('context.ratePlanSyncedWithChannex')}
                notSyncedTitle={t('context.ratePlanNotSyncedWithChannex')}
                clickToSyncTitle={t('context.clickToSyncRatePlanChannex')}
                disabled={isMissingOptions}
                disabledTitle={t('context.ratePlanMissingOptionsWarning')}
              />
            )}
          </div>
          <button
            onClick={handleEdit}
            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
            aria-label={t('context.editRatePlan')}
            title={t('context.editRatePlan')}
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
              {t('ratePlans.form.title')}
            </span>
            <p className="mt-1 font-semibold text-slate-900">{ratePlan.title}</p>
          </div>

          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {t('ratePlans.form.currency')}
            </span>
            <p className="mt-1 font-mono font-semibold text-slate-900">{ratePlan.currency}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t('ratePlans.form.sellMode')}
              </span>
              <p className="mt-1 text-sm text-slate-700">{formatSellMode(ratePlan.sellMode)}</p>
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t('ratePlans.form.rateMode')}
              </span>
              <p className="mt-1 text-sm text-slate-700">{formatRateMode(ratePlan.rateMode)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t('ratePlans.form.childrenFee')}
              </span>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {ratePlan.currency} {Number(ratePlan.childrenFee).toFixed(2)}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t('ratePlans.form.infantFee')}
              </span>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {ratePlan.currency} {Number(ratePlan.infantFee).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Warning message if options are missing */}
          {isMissingOptions && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg
                  className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">
                    {t('context.ratePlanMissingOptionsTitle')}
                  </p>
                  <p className="mt-1 text-xs text-amber-700">
                    {t('context.ratePlanMissingOptionsMessage')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error message if sync failed */}
          {syncError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg
                  className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">
                    {t('context.syncErrorTitle') || 'Sync Error'}
                  </p>
                  <p className="mt-1 text-xs text-red-700">
                    {(() => {
                      const error = syncError as any;
                      if (error?.response?.data?.errors?.details) {
                        const details = error.response.data.errors.details;
                        const messages = Object.entries(details)
                          .map(([key, value]: [string, any]) => {
                            if (Array.isArray(value)) {
                              return `${key}: ${value.join(', ')}`;
                            }
                            return `${key}: ${value}`;
                          })
                          .join('; ');
                        return messages;
                      }
                      if (error?.response?.data?.errors?.title) {
                        return error.response.data.errors.title;
                      }
                      if (error?.response?.data?.message) {
                        return error.response.data.message;
                      }
                      if (error?.message) {
                        return error.message;
                      }
                      return t('context.syncErrorMessage') || 'Failed to sync with Channex. Please try again.';
                    })()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <Button variant="outline" onClick={handleViewDetails} className="w-full mt-auto">
          {t('context.viewRatePlanDetails')}
        </Button>
      </div>
    </Card>
  );
};

export default RatePlanDetailsCard;
