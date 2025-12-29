# Rate Plan Channex Sync Query Specification

This document specifies the database query needed to fetch all rate plan data required for Channex synchronization (both CREATE and UPDATE operations).

## Required Tables and Joins

### Main Query Structure

```sql
SELECT 
  -- Rate Plan fields
  rp.id,
  rp.title,
  rp.property_id,
  rp.room_type_id,
  rp.tax_set_id,
  rp.parent_rate_plan_id,
  rp.children_fee,
  rp.infant_fee,
  rp.currency,
  rp.sell_mode,
  rp.rate_mode,
  rp.meal_type,
  rp.inherit_rate,
  rp.inherit_closed_to_arrival,
  rp.inherit_closed_to_departure,
  rp.inherit_stop_sell,
  rp.inherit_min_stay_arrival,
  rp.inherit_min_stay_through,
  rp.inherit_max_stay,
  rp.inherit_max_sell,
  rp.inherit_max_availability,
  rp.inherit_availability_offset,
  
  -- Rate Plan Options (JSON array aggregation)
  COALESCE(
    JSON_AGG(
      JSON_BUILD_OBJECT(
        'id', rpo.id,
        'occupancy', rpo.occupancy,
        'isPrimary', rpo.is_primary,
        'rate', rpo.rate
      )
      ORDER BY rpo.occupancy
    ) FILTER (WHERE rpo.id IS NOT NULL),
    '[]'::json
  ) AS options,
  
  -- Daily Rules (JSON array aggregation)
  COALESCE(
    JSON_AGG(
      JSON_BUILD_OBJECT(
        'id', rpdr.id,
        'weekday', rpdr.weekday,
        'maxStay', rpdr.max_stay,
        'minStayArrival', rpdr.min_stay_arrival,
        'minStayThrough', rpdr.min_stay_through,
        'closedToArrival', rpdr.closed_to_arrival,
        'closedToDeparture', rpdr.closed_to_departure,
        'stopSell', rpdr.stop_sell
      )
      ORDER BY rpdr.weekday
    ) FILTER (WHERE rpdr.id IS NOT NULL),
    '[]'::json
  ) AS daily_rules,
  
  -- Auto Rate Settings (JSON object aggregation, only if rate_mode = 'auto')
  CASE 
    WHEN rp.rate_mode = 'auto' THEN
      COALESCE(
        JSON_OBJECT_AGG(
          rpars.rule_name,
          rpars.rule_value
        ) FILTER (WHERE rpars.id IS NOT NULL),
        '{}'::json
      )
    ELSE NULL
  END AS auto_rate_settings

FROM rate_plans rp

-- LEFT JOIN Rate Plan Options (REQUIRED for Channex)
LEFT JOIN rate_plan_options rpo ON rpo.rate_plan_id = rp.id

-- LEFT JOIN Daily Rules (for weekday arrays)
LEFT JOIN rate_plan_daily_rules rpdr ON rpdr.rate_plan_id = rp.id

-- LEFT JOIN Auto Rate Settings (only needed if rate_mode = 'auto')
LEFT JOIN rate_plan_auto_rate_settings rpars ON rpars.rate_plan_id = rp.id 
  AND rp.rate_mode = 'auto'

WHERE rp.id = $1  -- Rate Plan ID parameter
  AND rp.company_id = $2  -- Company ID from JWT token

GROUP BY rp.id;
```

## Table Names (PostgreSQL Convention)

1. **`rate_plans`** - Main rate plan table
2. **`rate_plan_options`** - Occupancy options (REQUIRED)
3. **`rate_plan_daily_rules`** - Weekday-based restrictions
4. **`rate_plan_auto_rate_settings`** - Auto rate settings (only if rate_mode = 'auto')

## Required Fields from Each Table

### 1. `rate_plans` Table

**All fields required for Channex sync:**

| Field Name | Type | Channex Field | Notes |
|-----------|------|--------------|-------|
| `id` | UUID | - | Local rate plan ID |
| `title` | VARCHAR(255) | `title` | Required, unique per property |
| `property_id` | UUID | `property_id` | Required, must map to Channex property ID |
| `room_type_id` | UUID | `room_type_id` | Required, must map to Channex room type ID |
| `tax_set_id` | UUID | `tax_set_id` | Optional, must map to Channex tax set ID |
| `parent_rate_plan_id` | UUID | `parent_rate_plan_id` | Optional, must map to Channex parent rate plan ID |
| `children_fee` | DECIMAL(10,2) | `children_fee` | String format: "0.00" |
| `infant_fee` | DECIMAL(10,2) | `infant_fee` | String format: "0.00" |
| `currency` | VARCHAR(3) | `currency` | ISO 4217 code (EUR, USD, etc.) |
| `sell_mode` | VARCHAR(50) | `sell_mode` | "per_room" or "per_person" |
| `rate_mode` | VARCHAR(50) | `rate_mode` | "manual", "derived", "auto", "cascade" |
| `meal_type` | VARCHAR(50) | `meal_type` | Optional, see Channex docs for valid values |
| `inherit_rate` | BOOLEAN | `inherit_rate` | Default: false |
| `inherit_closed_to_arrival` | BOOLEAN | `inherit_closed_to_arrival` | Default: false |
| `inherit_closed_to_departure` | BOOLEAN | `inherit_closed_to_departure` | Default: false |
| `inherit_stop_sell` | BOOLEAN | `inherit_stop_sell` | Default: false |
| `inherit_min_stay_arrival` | BOOLEAN | `inherit_min_stay_arrival` | Default: false |
| `inherit_min_stay_through` | BOOLEAN | `inherit_min_stay_through` | Default: false |
| `inherit_max_stay` | BOOLEAN | `inherit_max_stay` | Default: false |
| `inherit_max_sell` | BOOLEAN | `inherit_max_sell` | Default: false |
| `inherit_max_availability` | BOOLEAN | `inherit_max_availability` | Default: false |
| `inherit_availability_offset` | BOOLEAN | `inherit_availability_offset` | Default: false |

### 2. `rate_plan_options` Table (REQUIRED)

**All fields required for Channex sync:**

| Field Name | Type | Channex Field | Notes |
|-----------|------|--------------|-------|
| `id` | BIGINT | - | Local option ID |
| `rate_plan_id` | UUID | - | Foreign key to rate_plans |
| `occupancy` | INTEGER | `occupancy` | Required, positive integer |
| `is_primary` | BOOLEAN | `is_primary` | Required, boolean |
| `rate` | DECIMAL(10,2) | `rate` | Required, non-negative number |

**Note:** Options are REQUIRED by Channex. At least one option must exist.

### 3. `rate_plan_daily_rules` Table

**All fields required for building weekday arrays:**

| Field Name | Type | Channex Array | Notes |
|-----------|------|---------------|-------|
| `id` | BIGINT | - | Local rule ID |
| `rate_plan_id` | UUID | - | Foreign key to rate_plans |
| `weekday` | INTEGER | Array Index | 1=Monday (index 0), 7=Sunday (index 6) |
| `max_stay` | INTEGER | `max_stay[]` | Optional, null = use default (0) |
| `min_stay_arrival` | INTEGER | `min_stay_arrival[]` | Optional, null = use default (1) |
| `min_stay_through` | INTEGER | `min_stay_through[]` | Optional, null = use default (1) |
| `closed_to_arrival` | BOOLEAN | `closed_to_arrival[]` | Required, boolean |
| `closed_to_departure` | BOOLEAN | `closed_to_departure[]` | Required, boolean |
| `stop_sell` | BOOLEAN | `stop_sell[]` | Required, boolean |

**Array Building Logic:**
- Each daily rule sets the value for its specific weekday
- If no rule exists for a day, use default values:
  - `max_stay`: 0
  - `min_stay_arrival`: 1
  - `min_stay_through`: 1
  - `closed_to_arrival`: false
  - `closed_to_departure`: false
  - `stop_sell`: false

### 4. `rate_plan_auto_rate_settings` Table (Conditional)

**Only needed if `rate_mode = 'auto'`:**

| Field Name | Type | Channex Field | Notes |
|-----------|------|--------------|-------|
| `id` | BIGINT | - | Local setting ID |
| `rate_plan_id` | UUID | - | Foreign key to rate_plans |
| `rule_name` | VARCHAR(255) | Key in object | Setting key name |
| `rule_value` | TEXT | Value in object | Setting value (can be complex JSON) |

**Note:** Auto rate settings are only required when `rate_mode = 'auto'`. Otherwise, send `null`.

## Complete Query Example (PostgreSQL)

```sql
-- Get Rate Plan with all Channex sync data
SELECT 
  -- Rate Plan Basic Info
  rp.id,
  rp.title,
  rp.property_id,
  rp.room_type_id,
  rp.tax_set_id,
  rp.parent_rate_plan_id,
  rp.children_fee,
  rp.infant_fee,
  rp.currency,
  rp.sell_mode,
  rp.rate_mode,
  rp.meal_type,
  
  -- Inheritance Flags
  rp.inherit_rate,
  rp.inherit_closed_to_arrival,
  rp.inherit_closed_to_departure,
  rp.inherit_stop_sell,
  rp.inherit_min_stay_arrival,
  rp.inherit_min_stay_through,
  rp.inherit_max_stay,
  rp.inherit_max_sell,
  rp.inherit_max_availability,
  rp.inherit_availability_offset,
  
  -- Options (REQUIRED - must have at least 1)
  COALESCE(
    JSON_AGG(
      DISTINCT JSON_BUILD_OBJECT(
        'id', rpo.id,
        'occupancy', rpo.occupancy,
        'isPrimary', rpo.is_primary,
        'rate', rpo.rate
      )
      ORDER BY rpo.occupancy
    ) FILTER (WHERE rpo.id IS NOT NULL),
    '[]'::json
  ) AS options,
  
  -- Daily Rules (for building weekday arrays)
  COALESCE(
    JSON_AGG(
      DISTINCT JSON_BUILD_OBJECT(
        'id', rpdr.id,
        'weekday', rpdr.weekday,
        'maxStay', rpdr.max_stay,
        'minStayArrival', rpdr.min_stay_arrival,
        'minStayThrough', rpdr.min_stay_through,
        'closedToArrival', rpdr.closed_to_arrival,
        'closedToDeparture', rpdr.closed_to_departure,
        'stopSell', rpdr.stop_sell
      )
      ORDER BY rpdr.weekday
    ) FILTER (WHERE rpdr.id IS NOT NULL),
    '[]'::json
  ) AS daily_rules,
  
  -- Auto Rate Settings (only if rate_mode = 'auto')
  CASE 
    WHEN rp.rate_mode = 'auto' THEN
      COALESCE(
        JSON_OBJECT_AGG(
          rpars.rule_name,
          rpars.rule_value
        ) FILTER (WHERE rpars.id IS NOT NULL),
        '{}'::json
      )
    ELSE NULL
  END AS auto_rate_settings

FROM rate_plans rp

-- LEFT JOIN Options (REQUIRED - at least 1 must exist)
LEFT JOIN rate_plan_options rpo ON rpo.rate_plan_id = rp.id

-- LEFT JOIN Daily Rules (for weekday arrays)
LEFT JOIN rate_plan_daily_rules rpdr ON rpdr.rate_plan_id = rp.id

-- LEFT JOIN Auto Rate Settings (conditional)
LEFT JOIN rate_plan_auto_rate_settings rpars ON rpars.rate_plan_id = rp.id 
  AND rp.rate_mode = 'auto'

WHERE rp.id = $1  -- Rate Plan ID
  AND rp.company_id = $2  -- Company ID (from JWT token)

GROUP BY 
  rp.id,
  rp.title,
  rp.property_id,
  rp.room_type_id,
  rp.tax_set_id,
  rp.parent_rate_plan_id,
  rp.children_fee,
  rp.infant_fee,
  rp.currency,
  rp.sell_mode,
  rp.rate_mode,
  rp.meal_type,
  rp.inherit_rate,
  rp.inherit_closed_to_arrival,
  rp.inherit_closed_to_departure,
  rp.inherit_stop_sell,
  rp.inherit_min_stay_arrival,
  rp.inherit_min_stay_through,
  rp.inherit_max_stay,
  rp.inherit_max_sell,
  rp.inherit_max_availability,
  rp.inherit_availability_offset;
```

## Response Format

The query should return a single row with the following structure:

```typescript
{
  // Rate Plan fields (all from rate_plans table)
  id: string;
  title: string;
  property_id: string;
  room_type_id: string;
  tax_set_id: string | null;
  parent_rate_plan_id: string | null;
  children_fee: number;
  infant_fee: number;
  currency: string;
  sell_mode: string;
  rate_mode: string;
  meal_type: string | null;
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
  
  // Aggregated arrays
  options: Array<{
    id: number;
    occupancy: number;
    isPrimary: boolean;
    rate: number;
  }>;
  
  daily_rules: Array<{
    id: number;
    weekday: number; // 1-7
    maxStay: number | null;
    minStayArrival: number | null;
    minStayThrough: number | null;
    closedToArrival: boolean;
    closedToDeparture: boolean;
    stopSell: boolean;
  }>;
  
  auto_rate_settings: Record<string, string> | null;
}
```

## Validation Rules

Before syncing to Channex, validate:

1. **Options are REQUIRED**: `options.length > 0`
2. **At least one primary option**: `options.some(opt => opt.isPrimary === true)`
3. **All options have valid rate**: `options.every(opt => opt.rate >= 0)`
4. **All options have valid occupancy**: `options.every(opt => opt.occupancy >= 1)`
5. **If rate_mode = 'auto'**: `auto_rate_settings !== null`
6. **Daily rules weekday range**: `daily_rules.every(rule => rule.weekday >= 1 && rule.weekday <= 7)`

## Notes

1. **Options are REQUIRED**: Channex will reject rate plans without options
2. **Daily Rules are optional**: If none exist, use default arrays (all zeros/false/ones)
3. **Auto Rate Settings**: Only needed when `rate_mode = 'auto'`, otherwise send `null`
4. **Inheritance flags**: Can only be `true` when `parent_rate_plan_id` exists
5. **All inheritance flags must be set**: Channex requires all inherit_* fields to be explicitly set

## Frontend Usage

The frontend will:
1. Receive this complete data structure
2. Map IDs to Channex IDs (property_id, room_type_id, tax_set_id, parent_rate_plan_id)
3. Build weekday arrays from daily_rules
4. Format all fields according to Channex API requirements
5. Send to Channex API

