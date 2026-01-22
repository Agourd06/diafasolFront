# Backend Guide: Booking Type Attribute

## Overview

This guide outlines the backend changes needed to support the `bookingType` attribute, which distinguishes between **internal/direct bookings** (created from the property's own website) and **OTA bookings** (from external booking platforms).

## Purpose

The `bookingType` field allows the frontend to:
- Hide OTA-specific fields (OTA Reservation Code, OTA Name, OTA Commission) for internal bookings
- Show OTA fields only when relevant
- Improve UX by reducing clutter for direct bookings

---

## Database Schema Changes

### 1. Add `booking_type` Column to Bookings Table

```sql
ALTER TABLE bookings 
ADD COLUMN booking_type ENUM('internal', 'ota') NULL DEFAULT NULL 
AFTER status;

-- Add index for filtering
CREATE INDEX idx_bookings_booking_type ON bookings(booking_type);
```

**Column Details:**
- **Type:** `ENUM('internal', 'ota')` or `VARCHAR(20)` if ENUM is not preferred
- **Nullable:** `YES` (for backward compatibility with existing bookings)
- **Default:** `NULL`
- **Position:** After `status` column (or wherever makes sense in your schema)

**Migration Notes:**
- Existing bookings will have `NULL` for `booking_type`
- You can infer the type from existing OTA fields:
  ```sql
  -- Migration script to set booking_type for existing bookings
  UPDATE bookings 
  SET booking_type = CASE 
    WHEN ota_reservation_code IS NOT NULL OR ota_name IS NOT NULL THEN 'ota'
    ELSE 'internal'
  END
  WHERE booking_type IS NULL;
  ```

---

## API Changes

### 1. Create Booking Endpoint (`POST /api/bookings`)

**Request Payload Addition:**

Add `bookingType` (camelCase) or `booking_type` (snake_case) to the request body:

```json
{
  "propertyId": "uuid",
  "status": "pending",
  "arrivalDate": "2024-01-15",
  "departureDate": "2024-01-20",
  "amount": "0.00",
  "currency": "EUR",
  "bookingType": "internal",  // NEW: 'internal' or 'ota'
  "occupancy": {
    "adults": 2,
    "children": 1,
    "infants": 1
  },
  "rooms": [...]
}
```

**Validation Rules:**

1. ✅ `bookingType` - **Optional** (for backward compatibility)
   - If provided, must be one of: `'internal'` or `'ota'`
   - If not provided, infer from OTA fields:
     - If `otaReservationCode` or `otaName` is provided → set to `'ota'`
     - Otherwise → set to `'internal'`

2. ✅ **Business Logic:**
   ```javascript
   // Pseudo-code for booking creation
   let bookingType = payload.bookingType;
   
   if (!bookingType) {
     // Infer from OTA fields
     if (payload.otaReservationCode || payload.otaName) {
       bookingType = 'ota';
     } else {
       bookingType = 'internal';
     }
   }
   
   // Validate: OTA bookings should have OTA fields
   if (bookingType === 'ota' && !payload.otaReservationCode && !payload.otaName) {
     // Optional: Warn or require at least one OTA field
   }
   
   // Validate: Internal bookings should NOT have OTA fields
   if (bookingType === 'internal' && (payload.otaReservationCode || payload.otaName)) {
     // Optional: Clear OTA fields or throw error
     // Recommendation: Clear them automatically
     payload.otaReservationCode = null;
     payload.otaName = null;
     payload.otaCommission = null;
   }
   ```

**Response:**

Include `booking_type` in the response:

```json
{
  "id": "booking-uuid",
  "propertyId": "uuid",
  "status": "pending",
  "arrivalDate": "2024-01-15",
  "departureDate": "2024-01-20",
  "amount": "0.00",
  "currency": "EUR",
  "booking_type": "internal",  // NEW: Include in response
  "uniqueId": "BDC-1234567890",
  "createdAt": "2024-01-10T10:00:00Z",
  "updatedAt": "2024-01-10T10:00:00Z",
  "rooms": [...]
}
```

---

### 2. Update Booking Endpoint (`PATCH /api/bookings/:id`)

**Request Payload:**

Allow `bookingType` to be updated:

```json
{
  "bookingType": "ota",  // Can be updated
  "otaReservationCode": "123456",
  "otaName": "Booking.com"
}
```

**Validation:**

- If `bookingType` is changed from `'internal'` to `'ota'`:
  - Require at least one OTA field (`otaReservationCode` or `otaName`)
  
- If `bookingType` is changed from `'ota'` to `'internal'`:
  - Optionally clear OTA fields (set to `NULL`)
  - Or keep them but mark as internal (frontend will hide them)

---

### 3. Get Booking Endpoint (`GET /api/bookings/:id`)

**Response:**

Always include `booking_type` in the response:

```json
{
  "id": "booking-uuid",
  "attributes": {
    "id": "booking-uuid",
    "property_id": "uuid",
    "status": "pending",
    "arrival_date": "2024-01-15",
    "departure_date": "2024-01-20",
    "amount": "0.00",
    "currency": "EUR",
    "booking_type": "internal",  // NEW: Include in response
    "unique_id": "BDC-1234567890",
    "ota_reservation_code": null,
    "ota_name": null,
    "ota_commission": null,
    "created_at": "2024-01-10T10:00:00Z",
    "updated_at": "2024-01-10T10:00:00Z"
  },
  "rooms": [...]
}
```

---

### 4. List Bookings Endpoint (`GET /api/bookings`)

**Query Parameters (Optional):**

Add filtering by `bookingType`:

```
GET /api/bookings?bookingType=internal
GET /api/bookings?bookingType=ota
```

**Response:**

Include `booking_type` in each booking object in the list.

---

## DTO/Entity Changes

### Booking Entity/DTO

Add the field to your booking entity/DTO:

```typescript
// TypeScript example
export interface Booking {
  id: string;
  propertyId: string;
  status: BookingStatus;
  arrivalDate: string;
  departureDate: string;
  amount: string;
  bookingType?: 'internal' | 'ota' | null;  // NEW
  uniqueId?: string | null;
  otaReservationCode?: string | null;
  otaName?: string | null;
  otaCommission?: string | null;
  // ... other fields
}
```

```java
// Java example
public class Booking {
    private String id;
    private String propertyId;
    private BookingStatus status;
    private LocalDate arrivalDate;
    private LocalDate departureDate;
    private String amount;
    private BookingType bookingType;  // NEW: enum or String
    // ... other fields
}

public enum BookingType {
    INTERNAL, OTA
}
```

---

## Validation Logic

### Recommended Validation Rules

1. **When `bookingType` is `'internal'`:**
   - OTA fields (`otaReservationCode`, `otaName`, `otaCommission`) should be `NULL` or empty
   - If OTA fields are provided, either:
     - **Option A:** Automatically clear them (recommended)
     - **Option B:** Reject with validation error

2. **When `bookingType` is `'ota'`:**
   - At least one of `otaReservationCode` or `otaName` should be provided
   - `otaCommission` is optional

3. **When `bookingType` is `NULL` (backward compatibility):**
   - Infer from OTA fields:
     - If any OTA field exists → treat as `'ota'`
     - Otherwise → treat as `'internal'`

---

## Migration Strategy

### Step 1: Add Column (Non-Breaking)

```sql
ALTER TABLE bookings 
ADD COLUMN booking_type ENUM('internal', 'ota') NULL DEFAULT NULL;
```

This is **non-breaking** because:
- Column is nullable
- Existing queries continue to work
- Frontend can handle `NULL` values

### ⚠️ IMPORTANT: Backend Query Safety

**Before adding the column, ensure your backend queries handle missing columns gracefully:**

1. **Option A: Make column selection optional**
   ```sql
   -- Only select booking_type if column exists
   SELECT 
     id, property_id, status, arrival_date, departure_date,
     -- Add booking_type only after migration
     -- booking_type,
     ...
   FROM bookings
   ```

2. **Option B: Use COALESCE with NULL check**
   ```sql
   SELECT 
     id, property_id, status,
     COALESCE(booking_type, NULL) as booking_type,  -- Safe even if column doesn't exist
     ...
   FROM bookings
   ```

3. **Option C: Check column existence before query**
   ```javascript
   // Pseudo-code
   const hasBookingTypeColumn = await checkColumnExists('bookings', 'booking_type');
   const selectFields = hasBookingTypeColumn 
     ? 'id, property_id, booking_type, ...'
     : 'id, property_id, ...';
   ```

**If you're getting 500 errors when fetching bookings:**
- The backend is likely trying to SELECT `booking_type` before the column exists
- Either add the column first, or make the SELECT query conditional
- The frontend will handle missing `booking_type` by inferring from OTA fields

### Step 2: Backfill Existing Data

```sql
-- Set booking_type for existing bookings based on OTA fields
UPDATE bookings 
SET booking_type = CASE 
  WHEN ota_reservation_code IS NOT NULL 
    OR ota_name IS NOT NULL 
    OR ota_commission IS NOT NULL 
  THEN 'ota'
  ELSE 'internal'
END
WHERE booking_type IS NULL;
```

### Step 3: Make Column Required (Optional, Future)

If you want to enforce `bookingType` for all new bookings:

```sql
-- First, ensure all existing bookings have a value
UPDATE bookings SET booking_type = 'internal' WHERE booking_type IS NULL;

-- Then make it NOT NULL
ALTER TABLE bookings 
MODIFY COLUMN booking_type ENUM('internal', 'ota') NOT NULL DEFAULT 'internal';
```

---

## API Examples

### Example 1: Create Internal Booking (from Room Search)

**Request:**
```json
POST /api/bookings
{
  "propertyId": "uuid",
  "status": "pending",
  "arrivalDate": "2024-01-15",
  "departureDate": "2024-01-20",
  "amount": "0.00",
  "currency": "EUR",
  "bookingType": "internal",
  "occupancy": {
    "adults": 2,
    "children": 1,
    "infants": 0
  },
  "rooms": [
    {
      "roomTypeId": "uuid",
      "numberOfRooms": 2,
      "checkinDate": "2024-01-15",
      "checkoutDate": "2024-01-20",
      "adults": 2,
      "children": 1,
      "infants": 0
    }
  ]
}
```

**Response:**
```json
{
  "id": "booking-uuid",
  "propertyId": "uuid",
  "status": "pending",
  "arrivalDate": "2024-01-15",
  "departureDate": "2024-01-20",
  "amount": "0.00",
  "currency": "EUR",
  "bookingType": "internal",
  "uniqueId": "BDC-1234567890",
  "otaReservationCode": null,
  "otaName": null,
  "otaCommission": null
}
```

### Example 2: Create OTA Booking

**Request:**
```json
POST /api/bookings
{
  "propertyId": "uuid",
  "status": "confirmed",
  "arrivalDate": "2024-01-15",
  "departureDate": "2024-01-20",
  "amount": "220.00",
  "currency": "EUR",
  "bookingType": "ota",
  "otaReservationCode": "1556013801",
  "otaName": "Booking.com",
  "otaCommission": "10.00",
  "occupancy": {
    "adults": 2,
    "children": 0,
    "infants": 0
  }
}
```

**Response:**
```json
{
  "id": "booking-uuid",
  "propertyId": "uuid",
  "status": "confirmed",
  "arrivalDate": "2024-01-15",
  "departureDate": "2024-01-20",
  "amount": "220.00",
  "currency": "EUR",
  "bookingType": "ota",
  "uniqueId": "BDC-1234567890",
  "otaReservationCode": "1556013801",
  "otaName": "Booking.com",
  "otaCommission": "10.00"
}
```

### Example 3: Update Booking Type

**Request:**
```json
PATCH /api/bookings/:id
{
  "bookingType": "ota",
  "otaReservationCode": "123456",
  "otaName": "Expedia"
}
```

---

## Testing Checklist

- [ ] Create internal booking with `bookingType: 'internal'` → OTA fields should be `NULL`
- [ ] Create OTA booking with `bookingType: 'ota'` → OTA fields should be saved
- [ ] Create booking without `bookingType` but with OTA fields → Should infer as `'ota'`
- [ ] Create booking without `bookingType` and without OTA fields → Should infer as `'internal'`
- [ ] Update booking from `'internal'` to `'ota'` → Should require OTA fields
- [ ] Update booking from `'ota'` to `'internal'` → Should clear OTA fields (optional)
- [ ] Get booking by ID → Should include `booking_type` in response
- [ ] List bookings → Should include `booking_type` in each booking
- [ ] Filter bookings by `bookingType` → Should return only matching bookings
- [ ] Backward compatibility: Existing bookings without `bookingType` → Should work correctly

---

## Summary

1. **Database:** Add `booking_type` column (nullable ENUM or VARCHAR)
2. **API Request:** Accept `bookingType` (camelCase) or `booking_type` (snake_case)
3. **API Response:** Always include `booking_type` (snake_case)
4. **Validation:** Infer `bookingType` from OTA fields if not provided
5. **Business Logic:** Clear OTA fields for internal bookings, require OTA fields for OTA bookings
6. **Migration:** Backfill existing bookings based on OTA fields

This change is **backward compatible** and improves the frontend UX by allowing conditional display of OTA fields.
