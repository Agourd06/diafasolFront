import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { 
  checkRatePlanExistsInChannex, 
  createChannexRatePlan as createChannexRatePlanApi,
  updateChannexRatePlan as updateChannexRatePlanApi,
  getChannexRatePlanById,
  CreateChannexRatePlanPayload,
  UpdateChannexRatePlanPayload,
  ChannexRatePlan,
} from '@/api/channex.api';
import { RatePlan } from '@/features/rate-plans/types';
import { RatePlanDailyRule } from '@/features/rate-plan-daily-rules/types';
import { getStoredChannexTaxSetId } from '@/hooks/useChannexTaxSet';
import { getRatePlanForChannexSync } from '@/api/rate-plans.api';
import type { RatePlanForChannexSync, RatePlanDailyRuleForSync } from '@/types/rate-plan-channex-sync';

interface UseChannexRatePlanOptions {
  ratePlan: RatePlan | null | undefined;
  channexRoomTypeId?: string | null;
  channexPropertyId?: string | null;
  enabled?: boolean;
}

// Storage keys for Channex ID mapping
export const CHANNEX_RATE_PLAN_MAP_KEY = 'channex_rate_plan_map';

// Get stored Channex rate plan ID for a local rate plan
export const getStoredChannexRatePlanId = (localRatePlanId: string): string | null => {
  try {
    const map = JSON.parse(localStorage.getItem(CHANNEX_RATE_PLAN_MAP_KEY) || '{}');
    return map[localRatePlanId] || null;
  } catch {
    return null;
  }
};

// Store Channex rate plan ID mapping
export const storeChannexRatePlanId = (localRatePlanId: string, channexRatePlanId: string) => {
  try {
    const map = JSON.parse(localStorage.getItem(CHANNEX_RATE_PLAN_MAP_KEY) || '{}');
    map[localRatePlanId] = channexRatePlanId;
    localStorage.setItem(CHANNEX_RATE_PLAN_MAP_KEY, JSON.stringify(map));
  } catch {
    // Silent fail - localStorage might not be available
  }
};

// Clear stored Channex rate plan ID for a local rate plan
export const clearStoredChannexRatePlanId = (localRatePlanId: string) => {
  try {
    const map = JSON.parse(localStorage.getItem(CHANNEX_RATE_PLAN_MAP_KEY) || '{}');
    delete map[localRatePlanId];
    localStorage.setItem(CHANNEX_RATE_PLAN_MAP_KEY, JSON.stringify(map));
  } catch {
    // Silent fail
  }
};

/**
 * Build weekday arrays from daily rules
 * 
 * BUSINESS LOGIC:
 * - Channex expects arrays of 7 values representing Monday through Sunday
 * - Index 0 = Monday, Index 1 = Tuesday, ..., Index 6 = Sunday
 * - Daily rules use weekday: 1=Monday, 2=Tuesday, ..., 7=Sunday
 * - Each daily rule sets the value for its specific weekday
 * - If no daily rule exists for a day, default values are used
 * 
 * IMPORTANT: When inheritance flags are enabled (inherit_max_stay, inherit_closed_to_arrival, etc.)
 * AND a parent_rate_plan_id exists, Channex will IGNORE these arrays and use the parent rate plan's
 * values instead. This is why you might see all false/zero values in Channex API responses even
 * though daily rules are configured in the UI - Channex is using the parent's values due to inheritance.
 * 
 * We still send these arrays because:
 * 1. They represent the explicit daily rules from our database
 * 2. Channex may use them when inheritance is disabled
 * 3. They serve as a fallback if the parent relationship is removed
 * 
 * To use your daily rules in Channex, set the relevant inherit_* flags to false for those fields.
 */
const buildWeekdayArrays = (dailyRules?: RatePlanDailyRule[] | RatePlanDailyRuleForSync[]) => {
  // Initialize with default values (Channex standard defaults)
  const maxStay = [0, 0, 0, 0, 0, 0, 0]; // 0 = no maximum stay restriction
  const minStayArrival = [1, 1, 1, 1, 1, 1, 1]; // 1 = minimum 1 night stay
  const minStayThrough = [1, 1, 1, 1, 1, 1, 1]; // 1 = minimum 1 night stay
  const closedToArrival = [false, false, false, false, false, false, false]; // false = open for arrivals
  const closedToDeparture = [false, false, false, false, false, false, false]; // false = open for departures
  const stopSell = [false, false, false, false, false, false, false]; // false = selling allowed

  if (dailyRules && dailyRules.length > 0) {
    // Map daily rules to arrays (weekday 1=Monday -> index 0, weekday 7=Sunday -> index 6)
    dailyRules.forEach((rule) => {
      const index = rule.weekday - 1; // Convert 1-7 to 0-6
      if (index >= 0 && index < 7) {
        // Only set values if they are explicitly provided (not null/undefined)
        // Handle both RatePlanDailyRule (from our types) and RatePlanDailyRuleForSync (from backend)
        const maxStayValue = 'maxStay' in rule ? rule.maxStay : (rule as any).max_stay;
        const minStayArrivalValue = 'minStayArrival' in rule ? rule.minStayArrival : (rule as any).min_stay_arrival;
        const minStayThroughValue = 'minStayThrough' in rule ? rule.minStayThrough : (rule as any).min_stay_through;
        const closedToArrivalValue = 'closedToArrival' in rule ? rule.closedToArrival : (rule as any).closed_to_arrival;
        const closedToDepartureValue = 'closedToDeparture' in rule ? rule.closedToDeparture : (rule as any).closed_to_departure;
        const stopSellValue = 'stopSell' in rule ? rule.stopSell : (rule as any).stop_sell;
        
        // Debug logging for each rule
        console.log(`🔍 Processing rule for weekday ${rule.weekday} (index ${index}):`, {
          rule,
          closedToArrivalValue,
          closedToDepartureValue,
          stopSellValue,
          closedToArrivalType: typeof closedToArrivalValue,
          closedToDepartureType: typeof closedToDepartureValue,
          stopSellType: typeof stopSellValue,
        });
        
        if (maxStayValue !== null && maxStayValue !== undefined) {
          maxStay[index] = Number(maxStayValue);
        }
        if (minStayArrivalValue !== null && minStayArrivalValue !== undefined) {
          minStayArrival[index] = Number(minStayArrivalValue);
        }
        if (minStayThroughValue !== null && minStayThroughValue !== undefined) {
          minStayThrough[index] = Number(minStayThroughValue);
        }
        // Ensure booleans are always boolean (not 0/1 or string)
        // Handle both numeric (1/0) and boolean (true/false) values
        const closedToArrivalBool = Boolean(
          closedToArrivalValue === 1 || 
          closedToArrivalValue === true || 
          closedToArrivalValue === '1' ||
          closedToArrivalValue === 'true'
        );
        const closedToDepartureBool = Boolean(
          closedToDepartureValue === 1 || 
          closedToDepartureValue === true || 
          closedToDepartureValue === '1' ||
          closedToDepartureValue === 'true'
        );
        const stopSellBool = Boolean(
          stopSellValue === 1 || 
          stopSellValue === true || 
          stopSellValue === '1' ||
          stopSellValue === 'true'
        );
        
        closedToArrival[index] = closedToArrivalBool;
        closedToDeparture[index] = closedToDepartureBool;
        stopSell[index] = stopSellBool;
        
        console.log(`✅ Set array[${index}] values:`, {
          closedToArrival: closedToArrivalBool,
          closedToDeparture: closedToDepartureBool,
          stopSell: stopSellBool,
        });
      }
    });
  }

  return {
    maxStay,
    minStayArrival,
    minStayThrough,
    closedToArrival,
    closedToDeparture,
    stopSell,
  };
};

/**
 * Map rate plan data from backend to Channex rate plan payload for CREATE
 * 
 * Uses the new backend endpoint that returns data in Channex format.
 * Only needs to map local IDs to Channex IDs and build weekday arrays.
 */
export const mapRatePlanToChannexCreatePayload = async (
  ratePlanId: string,
  channexRoomTypeId: string,
  channexPropertyId: string
): Promise<CreateChannexRatePlanPayload> => {
  // Fetch complete rate plan data from backend (includes options, daily rules, auto rate settings)
  const syncData = await getRatePlanForChannexSync(ratePlanId);
  
  // Validate that options exist (REQUIRED by Channex API)
  if (!syncData.options || syncData.options.length === 0) {
    throw new Error('Rate plan options are required for Channex sync. Please create options before syncing.');
  }
  
  // Build occupancy options from backend data (already in correct format)
  const options: CreateChannexRatePlanPayload['options'] = syncData.options.map(opt => {
    // Convert rate to number, handling both string and number types
    let rateValue: number;
    if (typeof opt.rate === 'string') {
      rateValue = parseFloat(opt.rate);
      if (isNaN(rateValue)) {
        rateValue = 0;
      }
    } else if (typeof opt.rate === 'number') {
      rateValue = opt.rate;
    } else {
      rateValue = 0;
    }
    
    // Ensure rate is non-negative (Channex requirement)
    rateValue = Math.max(0, rateValue);
    
    return {
      occupancy: Number(opt.occupancy),
      is_primary: Boolean(opt.isPrimary), // Backend returns camelCase, convert to snake_case for Channex
      rate: rateValue,
    };
  });

  // Build weekday arrays from daily rules (backend returns in camelCase)
  // IMPORTANT: These arrays represent the explicit daily rules from our database.
  // However, if inheritance flags (inherit_*) are true AND a parent_rate_plan_id exists,
  // Channex will IGNORE these arrays and use the parent rate plan's values instead.
  // This is why you might see all false/zero values in Channex response even though
  // daily rules are configured - Channex is using the parent's values due to inheritance.
  console.log('📋 Daily rules from sync data (CREATE):', syncData.daily_rules);
  const weekdayArrays = buildWeekdayArrays(syncData.daily_rules);
  console.log('📊 Built weekday arrays (CREATE):', {
    closedToArrival: weekdayArrays.closedToArrival,
    closedToDeparture: weekdayArrays.closedToDeparture,
    stopSell: weekdayArrays.stopSell,
  });
  
  // Map local IDs to Channex IDs
  // Check if we have a valid parent rate plan ID
  let hasParentRatePlan = false;
  let channexParentRatePlanId: string | null = null;
  if (syncData.parent_rate_plan_id) {
    channexParentRatePlanId = getStoredChannexRatePlanId(syncData.parent_rate_plan_id);
    if (channexParentRatePlanId) {
      hasParentRatePlan = true;
    }
  }
  
  // Map tax set ID to Channex tax set ID
  let channexTaxSetId: string | null = null;
  if (syncData.tax_set_id) {
    channexTaxSetId = getStoredChannexTaxSetId(syncData.tax_set_id);
  }

  // Build payload using backend data (already in Channex format)
  const payload: CreateChannexRatePlanPayload = {
    title: syncData.title,
    property_id: channexPropertyId,
    room_type_id: channexRoomTypeId,
    children_fee: syncData.children_fee.toString(),
    infant_fee: syncData.infant_fee.toString(),
    currency: syncData.currency,
    sell_mode: syncData.sell_mode || 'per_room',
    rate_mode: syncData.rate_mode || 'manual',
    options,
    max_stay: weekdayArrays.maxStay,
    min_stay_arrival: weekdayArrays.minStayArrival,
    min_stay_through: weekdayArrays.minStayThrough,
    closed_to_arrival: weekdayArrays.closedToArrival,
    closed_to_departure: weekdayArrays.closedToDeparture,
    stop_sell: weekdayArrays.stopSell,
  };
  
  console.log('📤 Payload arrays being sent to Channex (CREATE):', {
    closed_to_arrival: payload.closed_to_arrival,
    closed_to_departure: payload.closed_to_departure,
    stop_sell: payload.stop_sell,
  });

  // Add optional fields
  if (channexTaxSetId) {
    payload.tax_set_id = channexTaxSetId;
  }
  
  if (channexParentRatePlanId) {
    payload.parent_rate_plan_id = channexParentRatePlanId;
  }
  
  // Set inheritance flags (backend already validates and formats them)
  // IMPORTANT: Only set inherit fields to true if there's a parent_rate_plan_id
  // Channex validation: inherit fields can't be true when parent_rate_plan_id is nil
  payload.inherit_rate = hasParentRatePlan ? Boolean(syncData.inherit_rate) : false;
  payload.inherit_closed_to_arrival = hasParentRatePlan ? Boolean(syncData.inherit_closed_to_arrival) : false;
  payload.inherit_closed_to_departure = hasParentRatePlan ? Boolean(syncData.inherit_closed_to_departure) : false;
  payload.inherit_stop_sell = hasParentRatePlan ? Boolean(syncData.inherit_stop_sell) : false;
  payload.inherit_min_stay_arrival = hasParentRatePlan ? Boolean(syncData.inherit_min_stay_arrival) : false;
  payload.inherit_min_stay_through = hasParentRatePlan ? Boolean(syncData.inherit_min_stay_through) : false;
  payload.inherit_max_stay = hasParentRatePlan ? Boolean(syncData.inherit_max_stay) : false;
  payload.inherit_max_sell = hasParentRatePlan ? Boolean(syncData.inherit_max_sell) : false;
  payload.inherit_max_availability = hasParentRatePlan ? Boolean(syncData.inherit_max_availability) : false;
  payload.inherit_availability_offset = hasParentRatePlan ? Boolean(syncData.inherit_availability_offset) : false;

  // Add meal_type if present
  if (syncData.meal_type) {
    payload.meal_type = syncData.meal_type;
  }

  // Add auto_rate_settings if rate_mode is 'auto'
  if (syncData.rate_mode === 'auto' && syncData.auto_rate_settings) {
    payload.auto_rate_settings = syncData.auto_rate_settings;
  } else {
    payload.auto_rate_settings = null;
  }

  return payload;
};

/**
 * Map rate plan data from backend to Channex rate plan payload for UPDATE (PUT)
 * 
 * Uses the new backend endpoint that returns data in Channex format.
 * Note: property_id, room_type_id, and tax_set_id are excluded as they cannot be changed.
 */
export const mapRatePlanToChannexUpdatePayload = async (
  ratePlanId: string
): Promise<UpdateChannexRatePlanPayload> => {
  // Fetch complete rate plan data from backend (includes options, daily rules, auto rate settings)
  const syncData = await getRatePlanForChannexSync(ratePlanId);
  
  // Validate that options exist (REQUIRED by Channex API)
  if (!syncData.options || syncData.options.length === 0) {
    throw new Error('Rate plan options are required for Channex update. Please ensure options exist before syncing.');
  }
  
  // Build occupancy options from backend data (already in correct format)
  const options: CreateChannexRatePlanPayload['options'] = syncData.options.map(opt => {
    // Convert rate to number, handling both string and number types
    let rateValue: number;
    if (typeof opt.rate === 'string') {
      rateValue = parseFloat(opt.rate);
      if (isNaN(rateValue)) {
        rateValue = 0;
      }
    } else if (typeof opt.rate === 'number') {
      rateValue = opt.rate;
    } else {
      rateValue = 0;
    }
    
    // Ensure rate is non-negative (Channex requirement)
    rateValue = Math.max(0, rateValue);
    
    return {
      occupancy: Number(opt.occupancy),
      is_primary: Boolean(opt.isPrimary), // Backend returns camelCase, convert to snake_case for Channex
      rate: rateValue,
    };
  });

  // Build weekday arrays from daily rules (backend returns in camelCase)
  // IMPORTANT: These arrays represent the explicit daily rules from our database.
  // However, if inheritance flags (inherit_*) are true AND a parent_rate_plan_id exists,
  // Channex will IGNORE these arrays and use the parent rate plan's values instead.
  // This is why you might see all false/zero values in Channex response even though
  // daily rules are configured - Channex is using the parent's values due to inheritance.
  console.log('📋 Daily rules from sync data (UPDATE):', syncData.daily_rules);
  const weekdayArrays = buildWeekdayArrays(syncData.daily_rules);
  console.log('📊 Built weekday arrays (UPDATE):', {
    closedToArrival: weekdayArrays.closedToArrival,
    closedToDeparture: weekdayArrays.closedToDeparture,
    stopSell: weekdayArrays.stopSell,
  });
  
  // Map local parent rate plan ID to Channex parent rate plan ID
  let channexParentRatePlanId: string | null = null;
  if (syncData.parent_rate_plan_id) {
    channexParentRatePlanId = getStoredChannexRatePlanId(syncData.parent_rate_plan_id);
  }
  
  const hasParentRatePlan = !!channexParentRatePlanId;

  // Build update payload (excludes property_id, room_type_id, and tax_set_id as they cannot be changed)
  const payload: UpdateChannexRatePlanPayload = {
    title: syncData.title,
    children_fee: syncData.children_fee.toString(),
    infant_fee: syncData.infant_fee.toString(),
    currency: syncData.currency,
    sell_mode: syncData.sell_mode || 'per_room',
    rate_mode: syncData.rate_mode || 'manual',
    options,
    max_stay: weekdayArrays.maxStay,
    min_stay_arrival: weekdayArrays.minStayArrival,
    min_stay_through: weekdayArrays.minStayThrough,
    closed_to_arrival: weekdayArrays.closedToArrival,
    closed_to_departure: weekdayArrays.closedToDeparture,
    stop_sell: weekdayArrays.stopSell,
    parent_rate_plan_id: channexParentRatePlanId || null,
  };
  
  console.log('📤 Payload arrays being sent to Channex (UPDATE):', {
    closed_to_arrival: payload.closed_to_arrival,
    closed_to_departure: payload.closed_to_departure,
    stop_sell: payload.stop_sell,
    inherit_closed_to_arrival: payload.inherit_closed_to_arrival,
    inherit_closed_to_departure: payload.inherit_closed_to_departure,
    inherit_stop_sell: payload.inherit_stop_sell,
    parent_rate_plan_id: payload.parent_rate_plan_id,
  });

  // Set inheritance flags (backend already validates and formats them)
  // IMPORTANT: Only set inherit fields to true if there's a parent_rate_plan_id
  // Channex validation: inherit fields can't be true when parent_rate_plan_id is nil
  payload.inherit_rate = hasParentRatePlan ? Boolean(syncData.inherit_rate) : false;
  payload.inherit_closed_to_arrival = hasParentRatePlan ? Boolean(syncData.inherit_closed_to_arrival) : false;
  payload.inherit_closed_to_departure = hasParentRatePlan ? Boolean(syncData.inherit_closed_to_departure) : false;
  payload.inherit_stop_sell = hasParentRatePlan ? Boolean(syncData.inherit_stop_sell) : false;
  payload.inherit_min_stay_arrival = hasParentRatePlan ? Boolean(syncData.inherit_min_stay_arrival) : false;
  payload.inherit_min_stay_through = hasParentRatePlan ? Boolean(syncData.inherit_min_stay_through) : false;
  payload.inherit_max_stay = hasParentRatePlan ? Boolean(syncData.inherit_max_stay) : false;
  payload.inherit_max_sell = hasParentRatePlan ? Boolean(syncData.inherit_max_sell) : false;
  payload.inherit_max_availability = hasParentRatePlan ? Boolean(syncData.inherit_max_availability) : false;
  payload.inherit_availability_offset = hasParentRatePlan ? Boolean(syncData.inherit_availability_offset) : false;

  // Add meal_type if present
  if (syncData.meal_type) {
    payload.meal_type = syncData.meal_type;
  }

  // Set auto_rate_settings (required field)
  if (syncData.rate_mode === 'auto' && syncData.auto_rate_settings) {
    payload.auto_rate_settings = syncData.auto_rate_settings;
  } else {
    payload.auto_rate_settings = null;
  }

  return payload;
};

export const useChannexRatePlan = ({ ratePlan, channexRoomTypeId, channexPropertyId, enabled = true }: UseChannexRatePlanOptions) => {
  const queryClient = useQueryClient();
  const ratePlanId = ratePlan?.id;
  const ratePlanTitle = ratePlan?.title;

  // Fetch complete rate plan data for Channex sync (includes options, daily rules, auto rate settings)
  // This uses the new backend endpoint that returns all data in a single optimized query
  const {
    data: channexSyncData,
    isLoading: isLoadingSyncData,
  } = useQuery({
    queryKey: ['rate-plan-channex-sync', ratePlanId],
    queryFn: async () => {
      if (!ratePlanId) return null;
      try {
        return await getRatePlanForChannexSync(ratePlanId);
      } catch (error) {
        return null;
      }
    },
    enabled: enabled && !!ratePlanId,
    staleTime: 30 * 1000, // Cache for 30 seconds
    retry: 1,
  });

  // Extract options from sync data
  const ratePlanOptions = channexSyncData?.options || [];
  const hasOptions = ratePlanOptions.length > 0;
  const isMissingOptions = ratePlanId && !isLoadingSyncData && !hasOptions;

  // Check if rate plan exists in Channex
  // First try by stored ID, then fallback to title search
  const {
    data: channexRatePlan,
    isLoading: isChecking,
    error: checkError,
    refetch: refetchRatePlan,
  } = useQuery({
    queryKey: ['channex-rate-plan', ratePlanId],
    queryFn: async (): Promise<ChannexRatePlan | null> => {
      if (!ratePlanId || !ratePlanTitle || !channexRoomTypeId) return null;
      
      // First, check if we have a stored Channex ID for this rate plan
      const storedChannexId = getStoredChannexRatePlanId(ratePlanId);
      if (storedChannexId) {
        const ratePlanById = await getChannexRatePlanById(storedChannexId);
        if (ratePlanById) {
          return ratePlanById;
        }
      }
      
      // Fallback: search by title
      const ratePlanByTitle = await checkRatePlanExistsInChannex(ratePlanTitle, channexRoomTypeId);
      if (ratePlanByTitle) {
        // Store the mapping for future use
        storeChannexRatePlanId(ratePlanId, ratePlanByTitle.id);
        return ratePlanByTitle;
      }
      
      return null;
    },
    enabled: enabled && !!ratePlanId && !!ratePlanTitle && !!channexRoomTypeId,
    staleTime: 1 * 60 * 1000, // Cache for 1 minute
    retry: 1,
  });

  // Mutation to create rate plan in Channex
  const createMutation = useMutation({
    mutationFn: (payload: CreateChannexRatePlanPayload) => createChannexRatePlanApi(payload),
    onSuccess: (newRatePlan) => {
      if (ratePlanId) {
        storeChannexRatePlanId(ratePlanId, newRatePlan.id);
      }
      queryClient.setQueryData(['channex-rate-plan', ratePlanId], newRatePlan);
      // Invalidate sync data to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['rate-plan-channex-sync', ratePlanId] });
      refetchRatePlan();
    },
  });

  // Mutation to update rate plan in Channex
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateChannexRatePlanPayload }) => 
      updateChannexRatePlanApi(id, payload),
    onSuccess: (updatedRatePlan) => {
      // Update the cache with the new data
      queryClient.setQueryData(['channex-rate-plan', ratePlanId], updatedRatePlan);
      // Invalidate and refetch to ensure UI is updated
      queryClient.invalidateQueries({ queryKey: ['channex-rate-plan', ratePlanId] });
      // Invalidate sync data to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['rate-plan-channex-sync', ratePlanId] });
      refetchRatePlan();
    },
    onError: (error: unknown) => {
      // If 404, the rate plan doesn't exist in Channex anymore - clear the mapping
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 404 && ratePlanId) {
        clearStoredChannexRatePlanId(ratePlanId);
        // Invalidate query to force re-check
        queryClient.invalidateQueries({ queryKey: ['channex-rate-plan', ratePlanId] });
      }
    },
  });

  // Check if rate plan exists - either from query or from stored mapping
  const storedChannexId = ratePlanId ? getStoredChannexRatePlanId(ratePlanId) : null;
  const existsInChannex = !!channexRatePlan || !!storedChannexId;
  const channexIdToUse = channexRatePlan?.id || storedChannexId;

  // Track previous rate plan data to detect changes
  const previousRatePlanRef = useRef<string | null>(null);
  
  // Create a hash of the rate plan data to detect changes
  // Include options and daily rules in the hash to detect changes
  const getRatePlanHash = (syncData: RatePlanForChannexSync | null | undefined): string => {
    if (!syncData) return '';
    return JSON.stringify({
      title: syncData.title,
      children_fee: syncData.children_fee,
      infant_fee: syncData.infant_fee,
      currency: syncData.currency,
      sell_mode: syncData.sell_mode,
      rate_mode: syncData.rate_mode,
      tax_set_id: syncData.tax_set_id,
      parent_rate_plan_id: syncData.parent_rate_plan_id,
      // Include options in hash to detect option changes
      options: syncData.options ? syncData.options.map(o => ({ occupancy: o.occupancy, isPrimary: o.isPrimary, rate: o.rate })) : null,
      // Include daily rules in hash to detect daily rule changes
      daily_rules: syncData.daily_rules ? syncData.daily_rules.map(r => ({ weekday: r.weekday, maxStay: r.maxStay, minStayArrival: r.minStayArrival, minStayThrough: r.minStayThrough, closedToArrival: r.closedToArrival, closedToDeparture: r.closedToDeparture, stopSell: r.stopSell })) : null,
      // Include inheritance flags
      inherit_rate: syncData.inherit_rate,
      inherit_closed_to_arrival: syncData.inherit_closed_to_arrival,
      inherit_closed_to_departure: syncData.inherit_closed_to_departure,
      inherit_stop_sell: syncData.inherit_stop_sell,
      inherit_min_stay_arrival: syncData.inherit_min_stay_arrival,
      inherit_min_stay_through: syncData.inherit_min_stay_through,
      inherit_max_stay: syncData.inherit_max_stay,
      inherit_max_sell: syncData.inherit_max_sell,
      inherit_max_availability: syncData.inherit_max_availability,
      inherit_availability_offset: syncData.inherit_availability_offset,
    });
  };

  // Auto-sync when rate plan data changes and it exists in Channex
  useEffect(() => {
    if (!channexSyncData || !ratePlanId) {
      return;
    }

    // Don't auto-sync if options are missing
    if (isMissingOptions) {
      return;
    }

    // Create hash from sync data to detect changes
    const currentHash = getRatePlanHash(channexSyncData);
    const previousHash = previousRatePlanRef.current;

    // Only auto-sync if:
    // 1. The data has actually changed (not first render)
    // 2. We're not already syncing
    // 3. Options exist
    // 4. Rate plan exists in Channex
    if (
      previousHash !== null &&
      previousHash !== currentHash &&
      !createMutation.isPending &&
      !updateMutation.isPending &&
      channexIdToUse &&
      hasOptions
    ) {
      // Auto-update in Channex (uses new backend endpoint with all data)
      mapRatePlanToChannexUpdatePayload(ratePlanId).then((updatePayload) => {
        updateMutation.mutate({ id: channexIdToUse, payload: updatePayload });
      }).catch(() => {
        // Silent fail for auto-sync errors
      });
    }

    // Update the ref with current hash
    previousRatePlanRef.current = currentHash;
  }, [
    channexSyncData,
    ratePlanId,
    channexIdToUse,
    createMutation.isPending,
    updateMutation.isPending,
    updateMutation,
    hasOptions,
    isMissingOptions,
  ]);

  const handleSync = async () => {
    // Prevent sync if options are missing
    if (isMissingOptions) {
      return;
    }

    if (!ratePlanId) {
      return;
    }

    // For updates, we don't need channexRoomTypeId or channexPropertyId
    // For creates, we need them
    if (!channexIdToUse && (!channexRoomTypeId || !channexPropertyId)) {
      return;
    }

    if (createMutation.isPending || updateMutation.isPending) {
      return;
    }

    if (channexIdToUse) {
      // Update existing rate plan - use update payload (excludes property_id, room_type_id, tax_set_id)
      try {
        const updatePayload: UpdateChannexRatePlanPayload = await mapRatePlanToChannexUpdatePayload(ratePlanId);
        // Ensure we have a valid Channex ID before calling the mutation
        if (!channexIdToUse) {
          return;
        }
        updateMutation.mutate({ id: channexIdToUse, payload: updatePayload });
      } catch (error) {
        // Re-throw error so it's caught by the mutation's onError handler
        throw error;
      }
    } else if (channexPropertyId && channexRoomTypeId) {
      // Create new rate plan - use full create payload
      // Double-check options exist before creating
      if (!hasOptions) {
        return;
      }
      try {
        const createPayload = await mapRatePlanToChannexCreatePayload(ratePlanId, channexRoomTypeId, channexPropertyId);
        createMutation.mutate(createPayload);
      } catch (error) {
        // Re-throw error so it's caught by the mutation's onError handler
        throw error;
      }
    }
  };

  return {
    channexRatePlan,
    existsInChannex,
    isChecking,
    isSyncing: createMutation.isPending || updateMutation.isPending,
    isUpdating: updateMutation.isPending,
    checkError,
    syncError: createMutation.error || updateMutation.error,
    syncToChannex: handleSync,
    hasOptions,
    isMissingOptions,
    isLoadingOptions: isLoadingSyncData,
  };
};

