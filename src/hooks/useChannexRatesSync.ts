import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getGroupedRatesForChannex, type GetGroupedRatesParams, type ChannexRateRange, type GroupedRatesResponse } from '@/api/rate-plan-rates.api';
import { syncRatesToChannex, getChannexRestrictions, type GetChannexRestrictionsParams, getChannexRatePlanById } from '@/api/channex.api';
import { getRatesByRatePlan } from '@/api/rate-plan-rates.api';
import { getPeriodRulesByRatePlan } from '@/api/rate-plan-period-rules.api';
import { getStoredChannexRatePlanId } from './useChannexRatePlan';
import { findLocalRatePlanByChannexId, logRatePlanMappings } from '@/utils/findRatePlanByChannexId';

interface UseChannexRatesSyncOptions {
  ratePlanId: string;
  channexPropertyId?: string | null;
  channexRatePlanId?: string | null;
  enabled?: boolean;
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
}

/**
 * Hook for syncing rate plan rates to Channex
 * 
 * ⚠️ IMPORTANT: This hook does NOT auto-sync rates to Channex.
 * Rates are only synced when the user manually clicks the sync icon.
 * 
 * Workflow:
 * 1. Fetches grouped rates from backend (already in Channex format) - for preview only
 * 2. Sends grouped rates to Channex restrictions endpoint - ONLY when syncToChannex() is called
 * 3. Handles success/error states
 */
export const useChannexRatesSync = ({
  ratePlanId,
  channexPropertyId,
  channexRatePlanId,
  enabled = true,
  dateRange,
}: UseChannexRatesSyncOptions) => {
  const queryClient = useQueryClient();

  // Get Channex rate plan ID if not provided (try stored ID)
  const storedChannexRatePlanId = getStoredChannexRatePlanId(ratePlanId);
  const effectiveChannexRatePlanId = channexRatePlanId || storedChannexRatePlanId;

  // Fetch grouped rates
  const {
    data: groupedRates,
    isLoading: isLoadingGroupedRates,
    error: groupedRatesError,
  } = useQuery({
    queryKey: ['channex-grouped-rates', ratePlanId, dateRange],
    queryFn: () => {
      const params: GetGroupedRatesParams = {};
      if (dateRange?.startDate) params.startDate = dateRange.startDate;
      if (dateRange?.endDate) params.endDate = dateRange.endDate;
      return getGroupedRatesForChannex(ratePlanId, params);
    },
    enabled: enabled && !!ratePlanId,
  });

  // Fetch period rules to merge restrictions with rates
  const {
    data: periodRules,
    isLoading: isLoadingPeriodRules,
  } = useQuery({
    queryKey: ['rate-plan-period-rules', ratePlanId],
    queryFn: () => getPeriodRulesByRatePlan(ratePlanId),
    enabled: enabled && !!ratePlanId,
  });

  // Transform grouped rates to use Channex IDs, convert rates to cents, and merge restrictions
  const transformedGroupedRates = React.useMemo(() => {
    if (!groupedRates || !groupedRates.values || groupedRates.values.length === 0) {
      return null;
    }

    if (!channexPropertyId || !effectiveChannexRatePlanId) {
      console.warn('⚠️ Missing Channex IDs for rates sync:', {
        channexPropertyId,
        channexRatePlanId: effectiveChannexRatePlanId,
        localRatePlanId: ratePlanId,
      });
      return null;
    }

    // Helper function to find matching period rule for a date range
    const findMatchingPeriodRule = (dateFrom: string, dateTo: string) => {
      if (!periodRules || periodRules.length === 0) return null;
      
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      
      // Find period rule that overlaps with this date range
      return periodRules.find(rule => {
        const ruleStart = new Date(rule.startDate);
        const ruleEnd = new Date(rule.endDate);
        // Check if the rate range overlaps with the period rule range
        return (fromDate >= ruleStart && fromDate <= ruleEnd) || 
               (toDate >= ruleStart && toDate <= ruleEnd) ||
               (fromDate <= ruleStart && toDate >= ruleEnd);
      });
    };

    // Transform each rate range to use Channex IDs, convert rate to cents, and merge restrictions
    // Channex restrictions API expects rates in cents (smallest currency unit)
    // Local rate: 12.00 (dollars) -> Channex: 1200 (cents)
    const transformed: ChannexRateRange[] = groupedRates.values.map((range) => {
      // Convert rate from dollars to cents (multiply by 100)
      // Handle both number and string types
      let rateInCents: number;
      if (typeof range.rate === 'string') {
        rateInCents = Math.round(parseFloat(range.rate) * 100);
      } else if (typeof range.rate === 'number') {
        rateInCents = Math.round(range.rate * 100);
      } else {
        rateInCents = 0;
      }

      // Find matching period rule for restrictions
      const matchingRule = findMatchingPeriodRule(range.date_from, range.date_to);
      
      const result: ChannexRateRange = {
        ...range,
        property_id: channexPropertyId, // Replace local property_id with Channex property_id
        rate_plan_id: effectiveChannexRatePlanId, // Replace local rate_plan_id with Channex rate_plan_id
        rate: rateInCents, // Convert to cents
      };

      // Add restrictions from period rule if found
      if (matchingRule) {
        result.closed_to_arrival = matchingRule.closedToArrival;
        result.closed_to_departure = matchingRule.closedToDeparture;
        result.stop_sell = matchingRule.stopSell;
        if (matchingRule.minStayArrival !== null && matchingRule.minStayArrival !== undefined) {
          result.min_stay_arrival = matchingRule.minStayArrival;
        }
        if (matchingRule.minStayThrough !== null && matchingRule.minStayThrough !== undefined) {
          result.min_stay_through = matchingRule.minStayThrough;
        }
        if (matchingRule.maxStay !== null && matchingRule.maxStay !== undefined) {
          result.max_stay = matchingRule.maxStay;
        }
        
        console.log('🔒 Merged restrictions from period rule:', {
          dateFrom: range.date_from,
          dateTo: range.date_to,
          rule: matchingRule,
          restrictions: {
            closed_to_arrival: result.closed_to_arrival,
            closed_to_departure: result.closed_to_departure,
            stop_sell: result.stop_sell,
            min_stay_arrival: result.min_stay_arrival,
            min_stay_through: result.min_stay_through,
            max_stay: result.max_stay,
          },
        });
      }

      return result;
    });

    console.log('🔄 Transformed rates with restrictions:', {
      totalRanges: transformed.length,
      originalSample: groupedRates.values[0],
      transformedSample: transformed[0],
      allRanges: transformed.map(r => ({
        date_from: r.date_from,
        date_to: r.date_to,
        rate: r.rate,
        rate_plan_id: r.rate_plan_id,
        property_id: r.property_id,
        closed_to_arrival: r.closed_to_arrival,
        closed_to_departure: r.closed_to_departure,
        stop_sell: r.stop_sell,
        min_stay_arrival: r.min_stay_arrival,
        min_stay_through: r.min_stay_through,
        max_stay: r.max_stay,
      })),
      channexRatePlanId: effectiveChannexRatePlanId,
      localRatePlanId: ratePlanId,
      channexPropertyId: channexPropertyId,
      periodRulesCount: periodRules?.length || 0,
    });

    // Verify the rate plan ID matches
    if (transformed.length > 0 && transformed[0].rate_plan_id !== effectiveChannexRatePlanId) {
      console.error('❌ RATE PLAN ID MISMATCH!', {
        expected: effectiveChannexRatePlanId,
        actual: transformed[0].rate_plan_id,
        localRatePlanId: ratePlanId,
      });
    }

    // Check if a specific date is included in the ranges
    const checkDateInRanges = (date: string) => {
      const targetDate = new Date(date);
      const included = transformed.some(range => {
        const fromDate = new Date(range.date_from);
        const toDate = new Date(range.date_to);
        return targetDate >= fromDate && targetDate <= toDate;
      });
      console.log(`📅 Date ${date} included in ranges:`, included);
      if (!included) {
        console.warn(`⚠️ Date ${date} is NOT included in any rate range!`);
      }
      return included;
    };

    // Check for today's date and common dates
    const today = new Date().toISOString().split('T')[0];
    checkDateInRanges(today);
    checkDateInRanges('2025-12-30');

    return {
      values: transformed,
    };
  }, [groupedRates, channexPropertyId, effectiveChannexRatePlanId, ratePlanId]);

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      // CRITICAL: Refetch grouped rates to ensure we have the latest data
      // This prevents syncing stale cached data
      await queryClient.refetchQueries({ 
        queryKey: ['channex-grouped-rates', ratePlanId, dateRange] 
      });
      
      // Get the fresh data after refetch
      const freshGroupedRates = queryClient.getQueryData<GroupedRatesResponse>(['channex-grouped-rates', ratePlanId, dateRange]);
      
      if (!freshGroupedRates || !freshGroupedRates.values || freshGroupedRates.values.length === 0) {
        throw new Error('No rates found to sync. Please generate rates first.');
      }

      if (!channexPropertyId || !effectiveChannexRatePlanId) {
        throw new Error('Property and Rate Plan must be synced to Channex first before syncing rates.');
      }

      // Re-transform with fresh data
      const freshTransformed = freshGroupedRates.values.map((range) => {
        let rateInCents: number;
        if (typeof range.rate === 'string') {
          rateInCents = Math.round(parseFloat(range.rate) * 100);
        } else if (typeof range.rate === 'number') {
          rateInCents = Math.round(range.rate * 100);
        } else {
          rateInCents = 0;
        }

        const matchingRule = periodRules?.find(rule => {
          const fromDate = new Date(range.date_from);
          const toDate = new Date(range.date_to);
          const ruleStart = new Date(rule.startDate);
          const ruleEnd = new Date(rule.endDate);
          return (fromDate >= ruleStart && fromDate <= ruleEnd) || 
                 (toDate >= ruleStart && toDate <= ruleEnd) ||
                 (fromDate <= ruleStart && toDate >= ruleEnd);
        });

        const result: ChannexRateRange = {
          ...range,
          property_id: channexPropertyId,
          rate_plan_id: effectiveChannexRatePlanId,
          rate: rateInCents,
        };

        if (matchingRule) {
          result.closed_to_arrival = matchingRule.closedToArrival;
          result.closed_to_departure = matchingRule.closedToDeparture;
          result.stop_sell = matchingRule.stopSell;
          if (matchingRule.minStayArrival !== null && matchingRule.minStayArrival !== undefined) {
            result.min_stay_arrival = matchingRule.minStayArrival;
          }
          if (matchingRule.minStayThrough !== null && matchingRule.minStayThrough !== undefined) {
            result.min_stay_through = matchingRule.minStayThrough;
          }
          if (matchingRule.maxStay !== null && matchingRule.maxStay !== undefined) {
            result.max_stay = matchingRule.maxStay;
          }
        }

        return result;
      });

      const payloadToSend = { values: freshTransformed };

      console.log('🔄 Starting sync to Channex with FRESH data:', {
        ratePlanId,
        channexPropertyId,
        channexRatePlanId: effectiveChannexRatePlanId,
        rangesCount: payloadToSend.values.length,
        sampleRange: payloadToSend.values[0],
        fullPayload: JSON.stringify(payloadToSend, null, 2),
      });

      // Log all rate plan mappings for debugging
      logRatePlanMappings();

      // Send to Channex with fresh transformed data
      const result = await syncRatesToChannex(payloadToSend);
      
      console.log('✅ Sync completed:', {
        result,
        rangesSent: transformedGroupedRates.values.length,
      });

      return {
        success: true,
        rangesSent: transformedGroupedRates.values.length,
        data: result,
      };
    },
    onSuccess: (data) => {
      // Invalidate rate plan rates query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['ratePlanRates', 'ratePlan', ratePlanId] });
      // Also invalidate grouped rates query
      queryClient.invalidateQueries({ queryKey: ['channex-grouped-rates', ratePlanId] });
      
      // Show success message
      console.log(`✅ Successfully synced ${data.rangesSent} rate ranges to Channex`);
    },
  });

  // Check if rates exist
  const { data: ratesData } = useQuery({
    queryKey: ['ratePlanRates', 'ratePlan', ratePlanId, 'check'],
    queryFn: () => getRatesByRatePlan(ratePlanId, { page: 1, limit: 1 }),
    enabled: enabled && !!ratePlanId,
  });

  const hasRates = (ratesData?.meta?.total || 0) > 0;
  const rangesCount = transformedGroupedRates?.values?.length || 0;

  const handleSync = async () => {
    if (!hasRates) {
      throw new Error('No rates found. Please generate rates first.');
    }
    if (rangesCount === 0) {
      throw new Error('No rate ranges to sync. Please generate rates first.');
    }
    if (!channexPropertyId || !effectiveChannexRatePlanId) {
      throw new Error('Property and Rate Plan must be synced to Channex first before syncing rates.');
    }
    return await syncMutation.mutateAsync();
  };

  return {
    // Data
    groupedRates: transformedGroupedRates,
    rangesCount,
    hasRates,
    
    // Loading states
    isLoadingGroupedRates: isLoadingGroupedRates || isLoadingPeriodRules,
    isSyncing: syncMutation.isPending,
    
    // Error states
    groupedRatesError,
    syncError: syncMutation.error,
    
    // Actions
    syncToChannex: handleSync,
    
    // Status
    canSync: hasRates && rangesCount > 0 && !isLoadingGroupedRates && !!channexPropertyId && !!effectiveChannexRatePlanId,
    
    // Success state
    syncSuccess: syncMutation.isSuccess,
    syncResult: syncMutation.data,
    
    // Channex IDs status
    hasChannexIds: !!channexPropertyId && !!effectiveChannexRatePlanId,
    channexPropertyId,
    channexRatePlanId: effectiveChannexRatePlanId,
  };
};
