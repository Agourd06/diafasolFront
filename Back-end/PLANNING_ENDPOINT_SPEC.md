# Planning Endpoint Specification

## Overview
This endpoint provides all data needed for the planning/inventory grid view in a single request, optimizing performance by avoiding multiple API calls.

## Endpoint

**GET** `/api/planning/property/:propertyId`

## Query Parameters

- `startDate` (string, required) - Start date in format `YYYY-MM-DD`
- `endDate` (string, required) - End date in format `YYYY-MM-DD`
- `roomTypeIds` (string[], optional) - Filter by specific room type IDs (comma-separated)
- `ratePlanIds` (string[], optional) - Filter by specific rate plan IDs (comma-separated)

## Response Format

```json
{
  "propertyId": "550e8400-e29b-41d4-a716-446655440000",
  "startDate": "2025-12-22",
  "endDate": "2026-01-04",
  "roomTypes": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "room_type 1",
      "countOfRooms": 12,
      "availability": [
        {
          "id": 1,
          "date": "2025-12-22",
          "availability": 12
        },
        {
          "id": 2,
          "date": "2025-12-23",
          "availability": 12
        }
        // ... one entry per date in range
      ],
      "ratePlans": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "title": "rate plan 1",
          "code": "A10",
          "rates": [
            {
              "id": 1,
              "date": "2025-12-22",
              "rate": 12.00
            },
            {
              "id": 2,
              "date": "2025-12-23",
              "rate": 12.00
            }
            // ... one entry per date in range
          ]
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440003",
          "title": "rate plan 2",
          "code": "A2",
          "rates": [
            {
              "id": 3,
              "date": "2025-12-22",
              "rate": 10.00
            }
            // ... one entry per date in range
          ]
        }
      ]
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "title": "room_type 2",
      "countOfRooms": 5,
      "availability": [
        {
          "id": 5,
          "date": "2025-12-22",
          "availability": 0
        }
        // ... one entry per date in range
      ],
      "ratePlans": [
        // ... rate plans for this room type
      ]
    }
  ]
}
```

## Data Requirements

1. **Room Types**: All room types for the property
2. **Availability**: Daily availability for each room type for the date range
   - If no availability record exists for a date, use `countOfRooms` as default
   - Return one entry per date in the range
3. **Rate Plans**: All rate plans for each room type
4. **Rates**: Daily rates for each rate plan for the date range
   - If no rate record exists for a date, return `null` or omit the entry
   - Return one entry per date in the range

## Notes

- Dates should be in `YYYY-MM-DD` format
- All dates in the range should be included, even if no data exists (use defaults)
- The response should be optimized for the frontend grid display
- Missing availability should default to `countOfRooms`
- Missing rates can be `null` or omitted (frontend will handle display)

## Alternative: If endpoint doesn't exist yet

If this endpoint doesn't exist, the frontend can:
1. Fetch room types by property
2. For each room type, fetch availability by date range
3. For each room type, fetch rate plans
4. For each rate plan, fetch rates by date range

This will work but will be slower. The single endpoint is preferred for better performance.

