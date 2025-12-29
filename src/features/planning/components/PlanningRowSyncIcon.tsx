/**
 * Planning Row Sync Icon Component
 * 
 * Handles Channex sync for individual room types (availability) or rate plans (rates)
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useChannexAvailabilitySync } from '@/hooks/useChannexAvailabilitySync';
import { useChannexRatesSync } from '@/hooks/useChannexRatesSync';
import ChannexSyncIcon from '@/features/dashboard/components/ChannexSyncIcon';
import { getStoredChannexRoomTypeId } from '@/hooks/useChannexRoomType';
import { getStoredChannexRatePlanId } from '@/hooks/useChannexRatePlan';

interface PlanningRowSyncIconProps {
  type: 'availability' | 'rate';
  roomTypeId?: string;
  ratePlanId?: string;
  channexPropertyId?: string | null;
  startDate: string;
  endDate: string;
  hasChanges?: boolean; // Whether there are unsaved changes OR saved changes needing sync
  onSynced?: () => void; // Callback when sync is successful
}

const PlanningRowSyncIcon: React.FC<PlanningRowSyncIconProps> = ({
  type,
  roomTypeId,
  ratePlanId,
  channexPropertyId,
  startDate,
  endDate,
  hasChanges = false,
  onSynced,
}) => {
  const { t } = useTranslation();

  // Get Channex IDs from storage
  const channexRoomTypeId = roomTypeId ? getStoredChannexRoomTypeId(roomTypeId) : null;
  const channexRatePlanId = ratePlanId ? getStoredChannexRatePlanId(ratePlanId) : null;

  // Availability sync hook
  const {
    rangesCount: availabilityRangesCount,
    hasAvailability,
    isLoadingGroupedAvailability,
    isSyncing: isSyncingAvailability,
    syncError: availabilitySyncError,
    syncToChannex: syncAvailabilityToChannex,
    canSync: canSyncAvailability,
    syncSuccess: availabilitySyncSuccess,
  } = useChannexAvailabilitySync({
    roomTypeId: roomTypeId || '',
    channexPropertyId,
    channexRoomTypeId,
    enabled: type === 'availability' && !!roomTypeId && !!channexPropertyId,
    dateRange: { startDate, endDate },
  });
  

  // Rates sync hook
  const {
    rangesCount: ratesRangesCount,
    hasRates,
    isLoadingGroupedRates,
    isSyncing: isSyncingRates,
    syncError: ratesSyncError,
    syncToChannex: syncRatesToChannex,
    canSync: canSyncRates,
    syncSuccess: ratesSyncSuccess,
  } = useChannexRatesSync({
    ratePlanId: ratePlanId || '',
    channexPropertyId,
    channexRatePlanId,
    enabled: type === 'rate' && !!ratePlanId && !!channexPropertyId,
    dateRange: { startDate, endDate },
  });
  

  // Handle sync based on type
  const handleSync = async () => {
    try {
      if (type === 'availability' && roomTypeId) {
        await syncAvailabilityToChannex();
        // Call onSynced after successful sync
        if (onSynced) {
          onSynced();
        }
      } else if (type === 'rate' && ratePlanId) {
        await syncRatesToChannex();
        // Call onSynced after successful sync
        if (onSynced) {
          onSynced();
        }
      }
    } catch (error: any) {
      // Error is handled by the hook
      // Don't call onSynced on error
    }
  };

  // Get sync state based on type
  const isChecking = type === 'availability' ? isLoadingGroupedAvailability : isLoadingGroupedRates;
  const isSyncing = type === 'availability' ? isSyncingAvailability : isSyncingRates;
  const existsInChannex = type === 'availability' ? availabilitySyncSuccess : ratesSyncSuccess;
  const canSync = type === 'availability' ? canSyncAvailability : canSyncRates;
  const rangesCount = type === 'availability' ? availabilityRangesCount : ratesRangesCount;

  // Get disabled reason
  const getDisabledReason = () => {
    // First check if there are no changes
    if (!hasChanges) {
      return type === 'availability'
        ? t('planning.sync.noChanges', { defaultValue: 'No changes to sync. Make changes first.' })
        : t('planning.sync.noChanges', { defaultValue: 'No changes to sync. Make changes first.' });
    }
    
    if (type === 'availability') {
      if (!hasAvailability) {
        return t('roomTypeAvailability.sync.noAvailability', { defaultValue: 'No availability to sync' });
      }
      if (!channexPropertyId || !channexRoomTypeId) {
        return t('roomTypeAvailability.sync.missingChannexIds', { defaultValue: 'Property and Room Type must be synced to Channex first' });
      }
    } else {
      if (!hasRates) {
        return t('ratePlanRates.sync.noRates', { defaultValue: 'No rates to sync' });
      }
      if (!channexPropertyId || !channexRatePlanId) {
        return t('ratePlanRates.sync.missingChannexIds', { defaultValue: 'Property and Rate Plan must be synced to Channex first' });
      }
    }
    return '';
  };
  
  // Disable sync if there are no changes
  const isDisabled = !hasChanges || !canSync;

  // Don't show sync icon if Channex IDs are missing
  if (!channexPropertyId) {
    return null;
  }

  if (type === 'availability' && (!channexRoomTypeId || !roomTypeId)) {
    return null;
  }

  if (type === 'rate' && (!channexRatePlanId || !ratePlanId)) {
    return null;
  }

  return (
    <ChannexSyncIcon
      isChecking={isChecking}
      isSyncing={isSyncing}
      existsInChannex={existsInChannex || false}
      onSync={handleSync}
      syncedTitle={
        type === 'availability'
          ? t('roomTypeAvailability.sync.synced', {
              ranges: rangesCount,
              defaultValue: `Synced ${rangesCount} availability ranges to Channex`,
            })
          : t('ratePlanRates.sync.synced', {
              ranges: rangesCount,
              defaultValue: `Synced ${rangesCount} rate ranges to Channex`,
            })
      }
      notSyncedTitle={
        type === 'availability'
          ? t('roomTypeAvailability.sync.notSynced', { defaultValue: 'Not synced to Channex. Click to sync.' })
          : t('ratePlanRates.sync.notSynced', { defaultValue: 'Not synced to Channex. Click to sync.' })
      }
      clickToSyncTitle={
        type === 'availability'
          ? t('roomTypeAvailability.sync.clickToSync', {
              ranges: rangesCount,
              defaultValue: `Click to sync ${rangesCount} availability ranges to Channex`,
            })
          : t('ratePlanRates.sync.clickToSync', {
              ranges: rangesCount,
              defaultValue: `Click to sync ${rangesCount} rate ranges to Channex`,
            })
      }
      disabled={isDisabled}
      disabledTitle={getDisabledReason()}
    />
  );
};

export default PlanningRowSyncIcon;
