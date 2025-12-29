# Rate Plan Channex Sync - Query Summary

## Quick Reference: Tables and Fields Required

### Table 1: `rate_plans` (Main Table)
**All fields from this table are required:**

```sql
SELECT 
  id,                    -- UUID
  title,                 -- VARCHAR(255) - Required
  property_id,           -- UUID - Required
  room_type_id,          -- UUID - Required
  tax_set_id,            -- UUID - Optional
  parent_rate_plan_id,   -- UUID - Optional
  children_fee,          -- DECIMAL(10,2)
  infant_fee,            -- DECIMAL(10,2)
  currency,              -- VARCHAR(3) - ISO 4217
  sell_mode,            -- VARCHAR(50) - "per_room" or "per_person"
  rate_mode,            -- VARCHAR(50) - "manual", "derived", "auto", "cascade"
  meal_type,            -- VARCHAR(50) - Optional
  inherit_rate,          -- BOOLEAN
  inherit_closed_to_arrival,      -- BOOLEAN
  inherit_closed_to_departure,    -- BOOLEAN
  inherit_stop_sell,              -- BOOLEAN
  inherit_min_stay_arrival,       -- BOOLEAN
  inherit_min_stay_through,      -- BOOLEAN
  inherit_max_stay,               -- BOOLEAN
  inherit_max_sell,               -- BOOLEAN
  inherit_max_availability,       -- BOOLEAN
  inherit_availability_offset      -- BOOLEAN
FROM rate_plans
WHERE id = $1 AND company_id = $2;
```

### Table 2: `rate_plan_options` (REQUIRED - LEFT JOIN)
**At least one option must exist. All fields required:**

```sql
LEFT JOIN rate_plan_options rpo ON rpo.rate_plan_id = rp.id

Fields needed:
  id,                    -- BIGINT
  rate_plan_id,         -- UUID (FK)
  occupancy,            -- INTEGER - Required, >= 1
  is_primary,           -- BOOLEAN - Required
  rate                  -- DECIMAL(10,2) - Required, >= 0
```

**Aggregation:** JSON array of options, ordered by occupancy

### Table 3: `rate_plan_daily_rules` (Optional - LEFT JOIN)
**Used to build weekday arrays. All fields required:**

```sql
LEFT JOIN rate_plan_daily_rules rpdr ON rpdr.rate_plan_id = rp.id

Fields needed:
  id,                    -- BIGINT
  rate_plan_id,         -- UUID (FK)
  weekday,              -- INTEGER - Required, 1-7 (1=Monday, 7=Sunday)
  max_stay,             -- INTEGER - Optional (null = default 0)
  min_stay_arrival,     -- INTEGER - Optional (null = default 1)
  min_stay_through,     -- INTEGER - Optional (null = default 1)
  closed_to_arrival,    -- BOOLEAN - Required
  closed_to_departure,  -- BOOLEAN - Required
  stop_sell             -- BOOLEAN - Required
```

**Aggregation:** JSON array of daily rules, ordered by weekday

### Table 4: `rate_plan_auto_rate_settings` (Conditional - LEFT JOIN)
**Only needed if `rate_mode = 'auto'`. All fields required:**

```sql
LEFT JOIN rate_plan_auto_rate_settings rpars 
  ON rpars.rate_plan_id = rp.id 
  AND rp.rate_mode = 'auto'

Fields needed:
  id,                    -- BIGINT
  rate_plan_id,         -- UUID (FK)
  rule_name,            -- VARCHAR(255) - Key name
  rule_value            -- TEXT - Value (can be JSON string)
```

**Aggregation:** JSON object with rule_name as keys, rule_value as values

## Complete JOIN Structure

```
rate_plans (rp)
  ├── LEFT JOIN rate_plan_options (rpo)
  │     ON rpo.rate_plan_id = rp.id
  │
  ├── LEFT JOIN rate_plan_daily_rules (rpdr)
  │     ON rpdr.rate_plan_id = rp.id
  │
  └── LEFT JOIN rate_plan_auto_rate_settings (rpars)
        ON rpars.rate_plan_id = rp.id
        AND rp.rate_mode = 'auto'
```

## Field Mapping to Channex API

| Our Field | Channex Field | Type | Required | Notes |
|-----------|--------------|------|----------|-------|
| `title` | `title` | string | ✅ | Max 255 chars, unique per property |
| `property_id` | `property_id` | UUID | ✅ | Must map to Channex property ID |
| `room_type_id` | `room_type_id` | UUID | ✅ | Must map to Channex room type ID |
| `tax_set_id` | `tax_set_id` | UUID | ❌ | Must map to Channex tax set ID |
| `parent_rate_plan_id` | `parent_rate_plan_id` | UUID | ❌ | Must map to Channex parent rate plan ID |
| `children_fee` | `children_fee` | string | ❌ | Format: "0.00" |
| `infant_fee` | `infant_fee` | string | ❌ | Format: "0.00" |
| `currency` | `currency` | string | ❌ | ISO 4217 (3 uppercase letters) |
| `sell_mode` | `sell_mode` | string | ❌ | "per_room" or "per_person" |
| `rate_mode` | `rate_mode` | string | ❌ | "manual", "derived", "auto", "cascade" |
| `meal_type` | `meal_type` | string | ❌ | See Channex docs for valid values |
| `inherit_rate` | `inherit_rate` | boolean | ✅ | All inherit fields required |
| `inherit_closed_to_arrival` | `inherit_closed_to_arrival` | boolean | ✅ | |
| `inherit_closed_to_departure` | `inherit_closed_to_departure` | boolean | ✅ | |
| `inherit_stop_sell` | `inherit_stop_sell` | boolean | ✅ | |
| `inherit_min_stay_arrival` | `inherit_min_stay_arrival` | boolean | ✅ | |
| `inherit_min_stay_through` | `inherit_min_stay_through` | boolean | ✅ | |
| `inherit_max_stay` | `inherit_max_stay` | boolean | ✅ | |
| `inherit_max_sell` | `inherit_max_sell` | boolean | ✅ | |
| `inherit_max_availability` | `inherit_max_availability` | boolean | ✅ | |
| `inherit_availability_offset` | `inherit_availability_offset` | boolean | ✅ | |
| `options[]` | `options[]` | array | ✅ | At least 1 required |
| `options[].occupancy` | `options[].occupancy` | number | ✅ | |
| `options[].is_primary` | `options[].is_primary` | boolean | ✅ | |
| `options[].rate` | `options[].rate` | number | ❌ | |
| `daily_rules[]` → arrays | `max_stay[]` | array[7] | ❌ | Built from daily rules |
| `daily_rules[]` → arrays | `min_stay_arrival[]` | array[7] | ❌ | Built from daily rules |
| `daily_rules[]` → arrays | `min_stay_through[]` | array[7] | ❌ | Built from daily rules |
| `daily_rules[]` → arrays | `closed_to_arrival[]` | array[7] | ❌ | Built from daily rules |
| `daily_rules[]` → arrays | `closed_to_departure[]` | array[7] | ❌ | Built from daily rules |
| `daily_rules[]` → arrays | `stop_sell[]` | array[7] | ❌ | Built from daily rules |
| `auto_rate_settings` | `auto_rate_settings` | object\|null | ❌ | Only if rate_mode = 'auto' |

## Validation Checklist

Before returning data, validate:

- [ ] At least one option exists (`options.length > 0`)
- [ ] At least one option has `is_primary = true`
- [ ] All options have `occupancy >= 1`
- [ ] All options have `rate >= 0`
- [ ] If `rate_mode = 'auto'`, then `auto_rate_settings` is not null
- [ ] All daily rules have `weekday` between 1 and 7
- [ ] If `parent_rate_plan_id` is null, all `inherit_*` flags should be false
- [ ] All `inherit_*` flags are explicitly set (not null)

## Response Example

```json
{
  "id": "a79c9836-b31b-4493-8bab-77b4c2198d52",
  "title": "rate plan 1",
  "property_id": "0735c534-4f90-4da2-a23b-1aac65a9a1f5",
  "room_type_id": "ba2375c6-68d3-4d87-9098-d0d3694e3c9d",
  "tax_set_id": "0b937fe1-ed93-4953-b7bc-67174015cb4c",
  "parent_rate_plan_id": "62370bab-033f-43b5-ae65-0746a4f3997d",
  "children_fee": 2.00,
  "infant_fee": 12.00,
  "currency": "EUR",
  "sell_mode": "per_room",
  "rate_mode": "manual",
  "meal_type": "none",
  "inherit_rate": true,
  "inherit_closed_to_arrival": true,
  "inherit_closed_to_departure": true,
  "inherit_stop_sell": false,
  "inherit_min_stay_arrival": false,
  "inherit_min_stay_through": false,
  "inherit_max_stay": true,
  "inherit_max_sell": false,
  "inherit_max_availability": false,
  "inherit_availability_offset": false,
  "options": [
    {
      "id": 1,
      "occupancy": 10,
      "isPrimary": true,
      "rate": 12.00
    }
  ],
  "daily_rules": [
    {
      "id": 1,
      "weekday": 1,
      "maxStay": 12,
      "minStayArrival": 12,
      "minStayThrough": 1,
      "closedToArrival": true,
      "closedToDeparture": true,
      "stopSell": false
    },
    {
      "id": 2,
      "weekday": 3,
      "maxStay": 12,
      "minStayArrival": 12,
      "minStayThrough": 21,
      "closedToArrival": false,
      "closedToDeparture": true,
      "stopSell": false
    }
  ],
  "auto_rate_settings": null
}
```

