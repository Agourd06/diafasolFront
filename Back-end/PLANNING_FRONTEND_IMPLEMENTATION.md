# Planning Feature - Frontend Implementation Summary

## Overview
A planning/inventory grid view has been implemented that displays room type availability and rate plan rates in a hierarchical, date-based grid similar to Channex's inventory view.

## Files Created

### 1. API Client (`src/api/planning.api.ts`)
- `getPlanningData()` - Fetches all planning data for a property and date range
- `batchUpdateAvailability()` - Batch updates availability records
- `batchUpdateRates()` - Batch updates rate plan rates

### 2. Types (`src/features/planning/types.ts`)
- `PlanningResponse` - Main response structure
- `PlanningRoomType` - Room type with availability and rate plans
- `PlanningAvailability` - Daily availability record
- `PlanningRate` - Daily rate record
- `PlanningCellValue` - Cell edit tracking

### 3. Hooks (`src/features/planning/hooks/`)
- `usePlanningData` - Fetches planning data (with fallback to existing endpoints)
- `useBatchUpdateAvailability` - Batch updates availability
- `useBatchUpdateRates` - Batch updates rates

### 4. Components
- `PlanningGrid` (`src/features/planning/components/PlanningGrid.tsx`)
  - Hierarchical grid with room types, availability rows, and rate plan rows
  - Date columns with horizontal scrolling
  - Inline editing for availability and rates
  - Visual indicators (red for zero availability, yellow for edited cells)
  - Sticky first column for row labels

- `PlanningPage` (`src/features/planning/pages/PlanningPage.tsx`)
  - Date navigation (prev/next buttons, date pickers)
  - Save/Reset changes functionality
  - Filters (room types, rate plans) - UI ready, logic can be enhanced
  - Handles both batch updates and individual creates/updates

### 5. Routes
- Added route: `/planning` in `src/routes/AppRoutes.tsx`

### 6. Translations
- Added planning translations to `en.json` and `fr.json`

## Backend Endpoints Needed

### Required Endpoint (Recommended for Performance)

**GET** `/api/planning/property/:propertyId`

**Query Parameters:**
- `startDate` (required) - YYYY-MM-DD
- `endDate` (required) - YYYY-MM-DD
- `roomTypeIds` (optional) - Comma-separated room type IDs
- `ratePlanIds` (optional) - Comma-separated rate plan IDs

**Response Format:**
See `Back-end/PLANNING_ENDPOINT_SPEC.md` for full specification.

**Key Points:**
- Returns all room types for the property
- For each room type, includes:
  - Daily availability for the date range (one entry per date)
  - All rate plans for that room type
  - For each rate plan, daily rates for the date range (one entry per date)
- Missing availability defaults to `countOfRooms`
- Missing rates can be `null` or `0`

### Optional Batch Update Endpoints (For Better Performance)

**PATCH** `/api/planning/availability/batch`
- Body: `{ updates: [{ id: number, availability: number }, ...] }`

**PATCH** `/api/planning/rates/batch`
- Body: `{ updates: [{ id: number, rate: number }, ...] }`

**Note:** If these endpoints don't exist, the frontend will automatically fall back to individual create/update calls.

## Fallback Implementation

If the unified planning endpoint (`GET /api/planning/property/:propertyId`) doesn't exist, the frontend will:

1. Fetch room types by property: `GET /api/room-types/property/:propertyId`
2. Fetch rate plans by property: `GET /api/rate-plans/property/:propertyId`
3. For each room type:
   - Fetch availability: `GET /api/room-type-availability/room-type/:roomTypeId?startDate=...&endDate=...`
4. For each rate plan:
   - Fetch rates: `GET /api/rate-plan-rates/rate-plan/:ratePlanId?startDate=...&endDate=...`

This works but is slower due to multiple API calls.

## Features Implemented

✅ Hierarchical grid display (room types → availability → rate plans)
✅ Date-based columns with navigation
✅ Inline editing for availability and rates
✅ Visual indicators (zero availability in red, edited cells in yellow)
✅ Save/Reset changes functionality
✅ Handles both new records (create) and existing records (update)
✅ Sticky first column for row labels
✅ Horizontal scrolling for date columns
✅ Responsive design
✅ Translations (EN/FR)
✅ Error handling
✅ Loading states

## Usage

1. Navigate to `/planning` (requires property to be selected in context)
2. Select date range using date pickers or navigation arrows
3. Edit availability or rates directly in the grid cells
4. Click "Save Changes" to persist edits
5. Click "Reset Changes" to discard unsaved edits

## Next Steps (Optional Enhancements)

1. **Filters UI**: Add dropdowns for room type and rate plan filtering
2. **Bulk Operations**: Select multiple cells and apply same value
3. **Copy/Paste**: Copy values from one date to another
4. **Export**: Export planning data to CSV/Excel
5. **Visual Indicators**: Add icons for synced/unsynced status
6. **Keyboard Navigation**: Arrow keys to navigate between cells

## Testing

To test the planning view:
1. Ensure a property is selected in the app context
2. Navigate to `/planning`
3. The grid should display all room types, their availability, and rate plans
4. Try editing cells and saving changes
5. If the unified endpoint doesn't exist, check console for fallback messages

