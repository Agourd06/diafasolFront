import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getGroupedAvailabilityForChannex, type GetGroupedAvailabilityParams, type ChannexAvailabilityRange, type GroupedAvailabilityResponse } from '@/api/room-type-availability.api';
import { syncAvailabilityToChannex } from '@/api/channex.api';
import { getRoomTypeAvailabilityByRoomType } from '@/api/room-type-availability.api';
import { getStoredChannexRoomTypeId } from './useChannexRoomType';

interface UseChannexAvailabilitySyncOptions {
  roomTypeId: string;
  channexPropertyId?: string | null;
  channexRoomTypeId?: string | null;
  enabled?: boolean;
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
}

/**
 * Hook for syncing room type availability to Channex
 * 
 * ⚠️ IMPORTANT: This hook does NOT auto-sync availability to Channex.
 * Availability is only synced when the user manually clicks the sync icon.
 * 
 * Workflow:
 * 1. Fetches grouped availability from backend (already in Channex format) - for preview only
 * 2. Sends grouped availability to Channex availability endpoint - ONLY when syncToChannex() is called
 * 3. Handles success/error states
 */
export const useChannexAvailabilitySync = ({
  roomTypeId,
  channexPropertyId,
  channexRoomTypeId,
  enabled = true,
  dateRange,
}: UseChannexAvailabilitySyncOptions) => {
  const queryClient = useQueryClient();

  // Get Channex room type ID if not provided (try stored ID)
  const storedChannexRoomTypeId = getStoredChannexRoomTypeId(roomTypeId);
  const effectiveChannexRoomTypeId = channexRoomTypeId || storedChannexRoomTypeId;

  // Fetch grouped availability
  const {
    data: groupedAvailability,
    isLoading: isLoadingGroupedAvailability,
    error: groupedAvailabilityError,
  } = useQuery({
    queryKey: ['channex-grouped-availability', roomTypeId, dateRange],
    queryFn: () => {
      const params: GetGroupedAvailabilityParams = {};
      if (dateRange?.startDate) params.startDate = dateRange.startDate;
      if (dateRange?.endDate) params.endDate = dateRange.endDate;
      return getGroupedAvailabilityForChannex(roomTypeId, params);
    },
    enabled: enabled && !!roomTypeId,
  });

  // Transform grouped availability to use Channex IDs
  const transformedGroupedAvailability = React.useMemo(() => {
    if (!groupedAvailability || !groupedAvailability.values || groupedAvailability.values.length === 0) {
      return null;
    }

    if (!channexPropertyId || !effectiveChannexRoomTypeId) {
      console.warn('⚠️ Missing Channex IDs for availability sync:', {
        channexPropertyId,
        channexRoomTypeId: effectiveChannexRoomTypeId,
        localRoomTypeId: roomTypeId,
      });
      return null;
    }

    // Transform each availability range to use Channex IDs
    const transformed: ChannexAvailabilityRange[] = groupedAvailability.values.map((range) => ({
      ...range,
      property_id: channexPropertyId, // Replace local property_id with Channex property_id
      room_type_id: effectiveChannexRoomTypeId, // Replace local room_type_id with Channex room_type_id
      // Availability is already a number, no conversion needed
    }));

    console.log('🔄 Transformed availability:', {
      totalRanges: transformed.length,
      originalSample: groupedAvailability.values[0],
      transformedSample: transformed[0],
      allRanges: transformed.map(r => ({
        date_from: r.date_from,
        date_to: r.date_to,
        availability: r.availability,
        room_type_id: r.room_type_id,
        property_id: r.property_id,
      })),
      channexRoomTypeId: effectiveChannexRoomTypeId,
      localRoomTypeId: roomTypeId,
      channexPropertyId: channexPropertyId,
    });

    // Verify the room type ID matches
    if (transformed.length > 0 && transformed[0].room_type_id !== effectiveChannexRoomTypeId) {
      console.error('❌ ROOM TYPE ID MISMATCH!', {
        expected: effectiveChannexRoomTypeId,
        actual: transformed[0].room_type_id,
        localRoomTypeId: roomTypeId,
      });
    }

    return {
      values: transformed,
    };
  }, [groupedAvailability, channexPropertyId, effectiveChannexRoomTypeId, roomTypeId]);

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      // CRITICAL: Refetch grouped availability to ensure we have the latest data
      // This prevents syncing stale cached data
      await queryClient.refetchQueries({ 
        queryKey: ['channex-grouped-availability', roomTypeId, dateRange] 
      });
      
      // Get the fresh data after refetch
      const freshGroupedAvailability = queryClient.getQueryData<GroupedAvailabilityResponse>(['channex-grouped-availability', roomTypeId, dateRange]);
      
      if (!freshGroupedAvailability || !freshGroupedAvailability.values || freshGroupedAvailability.values.length === 0) {
        throw new Error('No availability found to sync. Please generate availability first.');
      }

      if (!channexPropertyId || !effectiveChannexRoomTypeId) {
        throw new Error('Property and Room Type must be synced to Channex first before syncing availability.');
      }

      // Re-transform with fresh data
      const freshTransformed = freshGroupedAvailability.values.map((range) => ({
        ...range,
        property_id: channexPropertyId,
        room_type_id: effectiveChannexRoomTypeId,
      }));

      const payloadToSend = { values: freshTransformed };

      console.log('🔄 Starting sync to Channex with FRESH data:', {
        roomTypeId,
        channexPropertyId,
        channexRoomTypeId: effectiveChannexRoomTypeId,
        rangesCount: payloadToSend.values.length,
        sampleRange: payloadToSend.values[0],
        fullPayload: JSON.stringify(payloadToSend, null, 2),
      });

      // Send to Channex with fresh transformed data
      const result = await syncAvailabilityToChannex(payloadToSend);
      
      console.log('✅ Sync completed:', {
        result,
        rangesSent: transformedGroupedAvailability.values.length,
      });

      return {
        success: true,
        rangesSent: transformedGroupedAvailability.values.length,
        data: result,
      };
    },
    onSuccess: (data) => {
      // Invalidate room type availability query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['roomTypeAvailability', 'roomType', roomTypeId] });
      // Also invalidate grouped availability query
      queryClient.invalidateQueries({ queryKey: ['channex-grouped-availability', roomTypeId] });
      
      // Show success message
      console.log(`✅ Successfully synced ${data.rangesSent} availability ranges to Channex`);
    },
  });

  // Check if availability exists
  const { data: availabilityData } = useQuery({
    queryKey: ['roomTypeAvailability', 'roomType', roomTypeId, 'check'],
    queryFn: () => getRoomTypeAvailabilityByRoomType(roomTypeId),
    enabled: enabled && !!roomTypeId,
  });

  const hasAvailability = (availabilityData?.length || 0) > 0;
  const rangesCount = transformedGroupedAvailability?.values?.length || 0;

  const handleSync = async () => {
    if (!hasAvailability) {
      throw new Error('No availability found. Please generate availability first.');
    }
    if (rangesCount === 0) {
      throw new Error('No availability ranges to sync. Please generate availability first.');
    }
    if (!channexPropertyId || !effectiveChannexRoomTypeId) {
      throw new Error('Property and Room Type must be synced to Channex first before syncing availability.');
    }
    return await syncMutation.mutateAsync();
  };

  return {
    // Data
    groupedAvailability: transformedGroupedAvailability,
    rangesCount,
    hasAvailability,
    
    // Loading states
    isLoadingGroupedAvailability,
    isSyncing: syncMutation.isPending,
    
    // Error states
    groupedAvailabilityError,
    syncError: syncMutation.error,
    
    // Actions
    syncToChannex: handleSync,
    
    // Status
    canSync: hasAvailability && rangesCount > 0 && !isLoadingGroupedAvailability && !!channexPropertyId && !!effectiveChannexRoomTypeId,
    
    // Success state
    syncSuccess: syncMutation.isSuccess,
    syncResult: syncMutation.data,
    
    // Channex IDs status
    hasChannexIds: !!channexPropertyId && !!effectiveChannexRoomTypeId,
    channexPropertyId,
    channexRoomTypeId: effectiveChannexRoomTypeId,
  };
};
