/**
 * Rate Plan Channex Sync Data Types
 * 
 * These types represent the complete data structure returned from the backend
 * query for Channex synchronization. This includes all rate plan data, options,
 * daily rules, and auto rate settings in a single response.
 */

/**
 * Rate Plan Option from backend (for Channex sync)
 * Backend returns in camelCase (matching Channex nested structure)
 */
export interface RatePlanOptionForSync {
  id: number; // bigint
  occupancy: number; // Positive integer (min: 1)
  isPrimary: boolean; // Boolean (camelCase from backend)
  rate: number; // Decimal (10,2), non-negative
}

/**
 * Daily Rule from backend (for Channex sync)
 * Backend returns in camelCase (matching Channex nested structure)
 */
export interface RatePlanDailyRuleForSync {
  id: number; // bigint
  weekday: 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1=Monday, 7=Sunday
  maxStay: number | null; // Optional (camelCase from backend)
  minStayArrival: number | null; // Optional (camelCase from backend)
  minStayThrough: number | null; // Optional (camelCase from backend)
  closedToArrival: boolean; // Required (camelCase from backend)
  closedToDeparture: boolean; // Required (camelCase from backend)
  stopSell: boolean; // Required (camelCase from backend)
}

/**
 * Complete Rate Plan data for Channex synchronization
 * 
 * This is the response structure from the backend query that includes
 * all necessary data for syncing to Channex (both CREATE and UPDATE).
 */
export interface RatePlanForChannexSync {
  // Rate Plan Basic Information
  id: string; // UUID
  title: string;
  property_id: string; // UUID - must be mapped to Channex property ID
  room_type_id: string; // UUID - must be mapped to Channex room type ID
  tax_set_id: string | null; // UUID - must be mapped to Channex tax set ID
  parent_rate_plan_id: string | null; // UUID - must be mapped to Channex parent rate plan ID
  children_fee: number; // Decimal (10,2)
  infant_fee: number; // Decimal (10,2)
  currency: string; // ISO 4217 code (3 uppercase letters)
  sell_mode: string; // "per_room" or "per_person"
  rate_mode: string; // "manual", "derived", "auto", "cascade"
  meal_type: string | null; // Optional, see Channex docs for valid values
  
  // Inheritance Flags (all required by Channex API)
  inherit_rate: boolean;
  inherit_closed_to_arrival: boolean;
  inherit_closed_to_departure: boolean;
  inherit_stop_sell: boolean;
  inherit_min_stay_arrival: boolean;
  inherit_min_stay_through: boolean;
  inherit_max_stay: boolean;
  inherit_max_sell: boolean;
  inherit_max_availability: boolean;
  inherit_availability_offset: boolean;
  
  // Options (REQUIRED - must have at least 1)
  options: RatePlanOptionForSync[];
  
  // Daily Rules (optional - used to build weekday arrays)
  daily_rules: RatePlanDailyRuleForSync[];
  
  // Auto Rate Settings (only if rate_mode = 'auto', otherwise null)
  auto_rate_settings: Record<string, string> | null;
}

