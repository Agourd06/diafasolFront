# Backend Guide: Direct Booking from Room Search

## Overview

This guide outlines the backend requirements for creating direct bookings from the room search page. This flow is for internal bookings (property's own website) and differs from OTA bookings by not requiring OTA-related fields.

> **Note:** See `BOOKING_TYPE_ATTRIBUTE.md` for details on the `bookingType` field that distinguishes internal bookings from OTA bookings.

## Current Booking System (Preserved)

The existing booking system supports OTA bookings with these fields:
- `otaReservationCode`
- `otaName`
- `otaCommission`
- `otaUniqueId` (in booking rooms)

**These fields remain optional** - existing OTA booking logic is NOT affected.

## New Direct Booking Flow

### Flow Summary
1. User searches rooms → selects room types → creates booking with status "pending"
2. Guest information added later
3. Payment/guarantee information added later
4. Rate plans can be added later to booking rooms

---

## API Endpoints Required

### 1. Create Direct Booking (Enhanced)

**Endpoint:** `POST /api/bookings`

**Purpose:** Create a booking from room search selection

**Request Payload:**
```json
{
  "propertyId": "uuid",
  "status": "pending",
  "arrivalDate": "2024-01-15",
  "departureDate": "2024-01-20",
  "amount": "0.00",  // Can be 0 initially, calculated later
  "currency": "EUR",  // Optional, default to property currency
  "bookingType": "internal",  // NEW: Distinguishes internal bookings from OTA bookings
  "occupancy": {
    "adults": 2,
    "children": 1,
    "infants": 1
  },
  "rooms": [  // NEW: Array of selected rooms
    {
      "roomTypeId": "uuid-1",
      "numberOfRooms": 2,  // How many rooms of this type
      "checkinDate": "2024-01-15",
      "checkoutDate": "2024-01-20",
      "adults": 2,
      "children": 1,
      "infants": 1
    },
    {
      "roomTypeId": "uuid-2",
      "numberOfRooms": 2,
      "checkinDate": "2024-01-15",
      "checkoutDate": "2024-01-20",
      "adults": 2,
      "children": 0,
      "infants": 0
    }
  ]
}
```

**Validation Rules:**
1. ✅ `propertyId` - Required
2. ✅ `status` - Required, must be valid status (default: "pending" for direct bookings)
3. ✅ `arrivalDate` - Required, format: YYYY-MM-DD
4. ✅ `departureDate` - Required, must be after arrivalDate
5. ✅ `amount` - Required (can be "0.00" initially)
6. ✅ `bookingType` - Optional, must be `'internal'` or `'ota'` (defaults to `'internal'` for direct bookings)
7. ✅ `occupancy` - Required, must have adults/children/infants as numbers
8. ✅ `rooms` - Required array, at least 1 room
9. ✅ Total `numberOfRooms` across all room selections must match the requested number from search
10. ✅ Each room must have valid `roomTypeId`, `checkinDate`, `checkoutDate`
11. ✅ Each room's occupancy (adults + children + infants) must not exceed room type capacity
12. ✅ **Availability Check**: Verify that each room type has enough availability for the date range
13. ✅ OTA fields (`otaReservationCode`, `otaName`, `otaCommission`) - Should be NULL for internal bookings (automatically cleared if provided)

**Availability Validation:**
```javascript
// Pseudo-code for availability check
for each room in rooms:
  for each date in dateRange(checkinDate, checkoutDate):
    availability = getAvailability(roomTypeId, date)
    if availability < numberOfRooms:
      return error: "Not enough availability for room type {roomTypeId} on {date}"
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
  "bookingType": "internal",  // NEW: Indicates this is an internal/direct booking
  "uniqueId": "BDC-1234567890",  // Auto-generated if not provided
  "otaReservationCode": null,  // Should be NULL for internal bookings
  "otaName": null,  // Should be NULL for internal bookings
  "otaCommission": null,  // Should be NULL for internal bookings
  "occupancy": {
    "adults": 2,
    "children": 1,
    "infants": 1
  },
  "rooms": [  // Created booking rooms
    {
      "id": "room-uuid-1",
      "bookingId": "booking-uuid",
      "roomTypeId": "uuid-1",
      "ratePlanId": null,  // Can be null initially
      "checkinDate": "2024-01-15",
      "checkoutDate": "2024-01-20",
      "adults": 2,
      "children": 1,
      "infants": 1,
      "amount": null
    },
    // ... more rooms
  ],
  "createdAt": "2024-01-10T10:00:00Z",
  "updatedAt": "2024-01-10T10:00:00Z"
}
```

**Error Responses:**
```json
// Availability insufficient
{
  "error": "INSUFFICIENT_AVAILABILITY",
  "message": "Not enough rooms available",
  "details": {
    "roomTypeId": "uuid-1",
    "date": "2024-01-16",
    "required": 2,
    "available": 1
  }
}

// Invalid room selection
{
  "error": "INVALID_ROOM_SELECTION",
  "message": "Total number of rooms (4) does not match requested (4)",
  "details": {
    "requested": 4,
    "selected": 3
  }
}
```

---

### 2. Update Booking Room - Add Rate Plan (Later)

**Endpoint:** `PATCH /api/booking-rooms/:id`

**Purpose:** Add rate plan to a booking room after creation

**Request Payload:**
```json
{
  "ratePlanId": "uuid"  // Add rate plan later
}
```

**Note:** This endpoint already exists, just ensure `ratePlanId` can be updated from NULL.

---

### 3. Add Guest Information (Later)

**Endpoint:** `POST /api/booking-guests` or `PATCH /api/bookings/:id/guest`

**Purpose:** Add guest information to existing booking

**Request Payload:**
```json
{
  "bookingId": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "language": "en",
  "country": "US"
}
```

**Note:** This endpoint already exists in the system.

---

### 4. Add Payment/Guarantee Information (Later)

**Endpoint:** `POST /api/booking-guarantees` or `PATCH /api/bookings/:id/guarantee`

**Purpose:** Add payment guarantee information

**Request Payload:**
```json
{
  "bookingId": "uuid",
  "cardType": "visa",
  "cardHolderName": "John Doe",
  "maskedCardNumber": "****1234",
  "expirationDate": "12/25"
}
```

**Note:** This endpoint already exists in the system.

---

## Database Schema Considerations

### Booking Rooms Table

**Current Schema:**
- `ratePlanId` - Should allow NULL (for direct bookings without rate plan initially)
- `otaUniqueId` - Should allow NULL (for direct bookings)

**Required Changes:**
- ✅ Ensure `ratePlanId` can be NULL (if not already)
- ✅ Ensure `otaUniqueId` can be NULL (if not already)

### Bookings Table

**Current Schema:**
- All OTA fields are already optional (nullable)
- `status` supports "pending" status
- `amount` can be "0.00" initially

**No Changes Required** ✅

---

## Business Logic Requirements

### 1. Availability Check

**When:** Before creating booking rooms

**Logic:**
```javascript
function validateAvailability(rooms, dateRange) {
  for (const room of rooms) {
    const dates = generateDateRange(room.checkinDate, room.checkoutDate);
    
    for (const date of dates) {
      const availability = getRoomTypeAvailability(room.roomTypeId, date);
      
      if (availability < room.numberOfRooms) {
        throw new Error(`Insufficient availability for ${room.roomTypeId} on ${date}`);
      }
    }
  }
}
```

**Important:** 
- Check availability for ALL dates in the stay period
- Consider existing bookings that might reduce availability
- If availability check fails, return clear error message

### 2. Room Selection Validation

**Rules:**
1. Total `numberOfRooms` across all selections must equal the requested number from search
2. Each room type must exist and belong to the property
3. Each room's occupancy must not exceed room type capacity
4. Check-in/check-out dates must be within booking arrival/departure dates

### 3. Booking Creation Flow

**Step 1: Validate Input**
- Validate booking payload
- Validate room selections
- Check availability

**Step 2: Create Booking**
- Create main booking record with status "pending"
- Generate uniqueId if not provided (format: "BDC-{timestamp}")

**Step 3: Create Booking Rooms**
- For each room selection:
  - Create `numberOfRooms` booking room records
  - Each record has same roomTypeId, dates, occupancy
  - `ratePlanId` can be NULL initially
  - `amount` can be NULL initially

**Step 4: Update Availability (Optional)**
- If you want to reserve availability immediately:
  - Decrease availability for each date in the stay period
  - This prevents double-booking
- Or handle availability reduction when booking is confirmed

**Step 5: Return Response**
- Return booking with all created rooms

### 4. Rate Plan Assignment (Later)

**When:** User adds rate plan to booking room

**Logic:**
- Validate rate plan belongs to room type
- Validate rate plan is active for the date range
- Calculate room amount based on rate plan rates
- Update booking room with ratePlanId and amount
- Recalculate total booking amount

### 5. Guest Information (Later)

**When:** User adds guest information

**Logic:**
- Create or update booking guest record
- Validate email format if provided
- Validate phone format if provided

### 6. Payment/Guarantee (Later)

**When:** User adds payment information

**Logic:**
- Create booking guarantee record
- Mask card number for security
- Update booking status if needed (e.g., from "pending" to "confirmed")

---

## API Endpoint Modifications

### Modify: `POST /api/bookings`

**Current Behavior:**
- Creates booking only
- Rooms added separately via `POST /api/booking-rooms`

**New Behavior (Backward Compatible):**
- If `rooms` array is provided in payload:
  - Create booking AND booking rooms in one transaction
  - Validate availability
  - Return booking with rooms
- If `rooms` array is NOT provided:
  - Keep existing behavior (create booking only)
  - This preserves OTA booking flow

**Implementation:**
```javascript
// Pseudo-code
POST /api/bookings:
  if (payload.rooms && payload.rooms.length > 0) {
    // New direct booking flow
    validateAvailability(payload.rooms);
    booking = createBooking(payload);
    rooms = createBookingRooms(booking.id, payload.rooms);
    return { ...booking, rooms };
  } else {
    // Existing OTA booking flow
    return createBooking(payload);
  }
```

---

## Error Handling

### Error Codes

1. **INSUFFICIENT_AVAILABILITY**
   - Status: 400 Bad Request
   - Message: "Not enough rooms available for selected dates"
   - Details: Include roomTypeId, date, required, available

2. **INVALID_ROOM_SELECTION**
   - Status: 400 Bad Request
   - Message: "Room selection does not match search criteria"
   - Details: Include requested vs selected counts

3. **ROOM_TYPE_NOT_FOUND**
   - Status: 404 Not Found
   - Message: "Room type not found"

4. **INVALID_OCCUPANCY**
   - Status: 400 Bad Request
   - Message: "Room occupancy exceeds room type capacity"

5. **INVALID_DATE_RANGE**
   - Status: 400 Bad Request
   - Message: "Check-in date must be before check-out date"

---

## Testing Checklist

### Direct Booking Creation
- [ ] Create booking with multiple room types
- [ ] Create booking with single room type, multiple rooms
- [ ] Verify availability is checked
- [ ] Verify booking status is "pending"
- [ ] Verify OTA fields are NULL
- [ ] Verify ratePlanId can be NULL in booking rooms
- [ ] Verify total rooms match requested number

### Availability Validation
- [ ] Reject booking if availability insufficient
- [ ] Check availability for all dates in range
- [ ] Handle edge cases (same day check-in/out)

### Backward Compatibility
- [ ] Existing OTA booking flow still works
- [ ] Booking creation without rooms array still works
- [ ] All existing endpoints unchanged

### Later Steps
- [ ] Add rate plan to booking room
- [ ] Add guest information
- [ ] Add payment guarantee
- [ ] Update booking status

---

## Summary

### What's New
1. ✅ `POST /api/bookings` accepts optional `rooms` array
2. ✅ Availability validation before booking creation
3. ✅ Support for multiple room types in one booking
4. ✅ Rate plan can be added later (NULL initially)
5. ✅ Guest info and payment added later

### What's Preserved
1. ✅ Existing OTA booking flow unchanged
2. ✅ All existing endpoints work as before
3. ✅ OTA fields remain optional
4. ✅ Existing booking wizard flow unchanged

### Database Changes
1. ✅ Ensure `ratePlanId` can be NULL in booking_rooms
2. ✅ Ensure `otaUniqueId` can be NULL in booking_rooms
3. ✅ No schema changes needed for bookings table

### Implementation Priority
1. **Phase 1:** Modify `POST /api/bookings` to accept `rooms` array
2. **Phase 2:** Add availability validation
3. **Phase 3:** Test backward compatibility
4. **Phase 4:** Frontend integration

---

## Questions for Backend Team

1. Should availability be reduced immediately when booking is created, or only when status changes to "confirmed"?
2. Should we generate `uniqueId` automatically if not provided? (Format: "BDC-{timestamp}")
3. Should we calculate initial `amount` based on default rate plans, or leave it as "0.00"?
4. Do we need to handle partial availability? (e.g., 3 rooms requested but only 2 available)
5. Should we create separate booking room records for each room, or one record with `numberOfRooms` field?

---

## Example Request/Response

### Request
```json
POST /api/bookings
{
  "propertyId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "arrivalDate": "2024-02-15",
  "departureDate": "2024-02-20",
  "amount": "0.00",
  "currency": "EUR",
  "occupancy": {
    "adults": 2,
    "children": 1,
    "infants": 1
  },
  "rooms": [
    {
      "roomTypeId": "room-type-uuid-1",
      "numberOfRooms": 2,
      "checkinDate": "2024-02-15",
      "checkoutDate": "2024-02-20",
      "adults": 2,
      "children": 1,
      "infants": 1
    },
    {
      "roomTypeId": "room-type-uuid-2",
      "numberOfRooms": 2,
      "checkinDate": "2024-02-15",
      "checkoutDate": "2024-02-20",
      "adults": 2,
      "children": 0,
      "infants": 0
    }
  ]
}
```

### Response
```json
{
  "id": "booking-uuid",
  "propertyId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "arrivalDate": "2024-02-15",
  "departureDate": "2024-02-20",
  "amount": "0.00",
  "currency": "EUR",
  "uniqueId": "BDC-1707820800000",
  "occupancy": {
    "adults": 2,
    "children": 1,
    "infants": 1
  },
  "rooms": [
    {
      "id": "room-uuid-1",
      "bookingId": "booking-uuid",
      "roomTypeId": "room-type-uuid-1",
      "ratePlanId": null,
      "checkinDate": "2024-02-15",
      "checkoutDate": "2024-02-20",
      "adults": 2,
      "children": 1,
      "infants": 1,
      "amount": null
    },
    {
      "id": "room-uuid-2",
      "bookingId": "booking-uuid",
      "roomTypeId": "room-type-uuid-1",
      "ratePlanId": null,
      "checkinDate": "2024-02-15",
      "checkoutDate": "2024-02-20",
      "adults": 2,
      "children": 1,
      "infants": 1,
      "amount": null
    },
    {
      "id": "room-uuid-3",
      "bookingId": "booking-uuid",
      "roomTypeId": "room-type-uuid-2",
      "ratePlanId": null,
      "checkinDate": "2024-02-15",
      "checkoutDate": "2024-02-20",
      "adults": 2,
      "children": 0,
      "infants": 0,
      "amount": null
    },
    {
      "id": "room-uuid-4",
      "bookingId": "booking-uuid",
      "roomTypeId": "room-type-uuid-2",
      "ratePlanId": null,
      "checkinDate": "2024-02-15",
      "checkoutDate": "2024-02-20",
      "adults": 2,
      "children": 0,
      "infants": 0,
      "amount": null
    }
  ],
  "createdAt": "2024-02-10T10:00:00Z",
  "updatedAt": "2024-02-10T10:00:00Z"
}
```

---

**End of Backend Guide**
