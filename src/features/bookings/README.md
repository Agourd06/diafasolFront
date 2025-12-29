# Bookings Management System

A comprehensive booking management system with a sophisticated multi-step wizard for creating bookings and complete CRUD operations.

## 📁 Structure

```
bookings/
├── api/                          # API clients for all endpoints
│   ├── bookings.api.ts          # Main booking operations
│   ├── booking-rooms.api.ts     # Room management
│   ├── booking-room-days.api.ts # Daily pricing
│   ├── booking-services.api.ts  # Additional services
│   ├── booking-guarantees.api.ts # Payment guarantees
│   ├── booking-guests.api.ts    # Guest information
│   ├── booking-revisions.api.ts # Audit trail
│   └── index.ts                 # Barrel export
├── components/
│   ├── forms/                   # Multi-step form components
│   │   ├── BookingForm.tsx     # Step 1: Basic booking info
│   │   ├── RoomsForm.tsx       # Step 2: Add rooms
│   │   ├── RoomDaysForm.tsx    # Step 3: Daily pricing
│   │   ├── ServicesForm.tsx    # Step 4: Additional services
│   │   ├── GuaranteeForm.tsx   # Step 5: Payment guarantee
│   │   ├── GuestForm.tsx       # Step 6: Guest information
│   │   ├── ReviewForm.tsx      # Step 7: Review & confirm
│   │   └── index.ts
│   └── BookingStepIndicator.tsx # Progress indicator
├── context/
│   └── BookingWizardContext.tsx # Wizard state management
├── hooks/
│   ├── useBookings.ts           # Booking queries & mutations
│   ├── useBookingMutations.ts   # All nested resource mutations
│   └── index.ts
├── pages/
│   ├── BookingsListPage.tsx     # Main list with filters
│   ├── BookingDetailsPage.tsx   # Complete booking view
│   ├── CreateBookingPage.tsx    # Multi-step wizard
│   └── index.ts
├── types/
│   └── index.ts                 # Complete TypeScript definitions
└── README.md                    # This file
```

## 🎯 Features

### 1. Multi-Step Booking Creation Wizard

A sophisticated 7-step wizard for creating complete bookings:

1. **Booking Info** - Basic booking details (dates, amount, status, OTA info)
2. **Rooms** - Add multiple rooms with occupancy and pricing
3. **Room Days** - Set daily pricing for each room
4. **Services** - Add additional services (breakfast, parking, etc.)
5. **Guarantee** - Payment guarantee/card information (PCI compliant)
6. **Guest Info** - Customer details and company information
7. **Review** - Review all information before completing

**Features:**
- Visual progress indicator with step navigation
- Form validation at each step
- State persistence across steps
- Ability to edit previous steps
- Optional steps (services, guarantee, guest)
- Auto-calculation of totals

### 2. Bookings List Page

**Features:**
- Paginated list of all bookings
- Status filter (new, pending, confirmed, etc.)
- Search by ID, OTA name, reservation code
- Color-coded status badges
- Sortable columns
- Click to view details

### 3. Booking Details Page

**Features:**
- Complete booking information
- All nested data (rooms, services, guarantee, guest)
- Formatted dates and amounts
- Color-coded status
- Organized sections
- Back navigation

### 4. API Integration

Complete API clients for all 7 endpoints:
- `/api/bookings` - Main booking CRUD
- `/api/booking-rooms` - Room management
- `/api/booking-room-days` - Daily pricing
- `/api/booking-services` - Services
- `/api/booking-guarantees` - Payment guarantees
- `/api/booking-guests` - Guest information
- `/api/booking-revisions` - Audit trail

## 🚀 Usage

### Creating a Booking

```typescript
import { CreateBookingPage } from '@/features/bookings/pages';

// Navigate to /bookings/create
// Follow the 7-step wizard
// Each step saves data to the backend
// Review and complete at the end
```

### Viewing Bookings

```typescript
import { BookingsListPage } from '@/features/bookings/pages';

// Navigate to /bookings
// Filter by status or search
// Click any booking to view details
```

### Using Hooks

```typescript
import { useBookings, useBooking, useCreateBooking } from '@/features/bookings/hooks';

// Fetch paginated bookings
const { data, isLoading } = useBookings({
  page: 1,
  limit: 20,
  status: 'confirmed',
  search: 'BDC-123',
});

// Fetch single booking with nested data
const { data: booking } = useBooking(bookingId);

// Create booking
const createMutation = useCreateBooking();
await createMutation.mutateAsync(payload);
```

## 📝 TypeScript Types

All types are fully typed with comprehensive interfaces:

```typescript
import type {
  Booking,
  CompleteBooking,
  BookingRoom,
  BookingRoomDay,
  BookingService,
  BookingGuarantee,
  BookingGuest,
  BookingRevision,
  BookingStatus,
  CreateBookingPayload,
  // ... and more
} from '@/features/bookings/types';
```

## 🎨 UI/UX Features

- **Sophisticated Design**: Modern, clean interface with gradient buttons
- **Responsive**: Works on all screen sizes
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: Graceful error messages
- **Validation**: Real-time form validation
- **Accessibility**: ARIA labels and keyboard navigation
- **Color Coding**: Status-based color schemes
- **Smooth Transitions**: Animated interactions

## 🔒 Security

- **PCI Compliance**: CVV is never stored
- **Masked Card Numbers**: Only masked numbers are stored
- **JWT Authentication**: All API calls are authenticated
- **Company Scoping**: All data is scoped to the user's company

## 🛣️ Routes

```typescript
/bookings                    // List all bookings
/bookings/create            // Create new booking (wizard)
/bookings/:bookingId        // View booking details
```

## 🔗 Navigation

The Bookings button is available in the ContextHeader (next to Planning and Events) when a property is selected.

## 📊 Data Flow

```
1. User fills Step 1 (Booking Info)
   → POST /api/bookings
   → Save booking ID

2. User adds rooms (Step 2)
   → POST /api/booking-rooms (for each room)
   → Save room IDs

3. User sets daily pricing (Step 3)
   → POST /api/booking-room-days (for each day of each room)

4. User adds services (Step 4 - Optional)
   → POST /api/booking-services (for each service)

5. User adds guarantee (Step 5 - Optional)
   → POST /api/booking-guarantees

6. User adds guest info (Step 6 - Optional)
   → POST /api/booking-guests

7. User reviews and completes
   → Navigate to booking details page
```

## 🧪 Best Practices

- **Code Separation**: Clear separation of concerns (API, hooks, components, types)
- **Reusability**: Reusable components and hooks
- **Type Safety**: Full TypeScript coverage
- **Error Handling**: Comprehensive error handling
- **Performance**: React Query caching and optimistic updates
- **Maintainability**: Well-documented and organized code
- **Scalability**: Easy to extend with new features

## 🎯 Future Enhancements

Potential future features:
- Bulk booking operations
- Export to CSV/PDF
- Calendar view
- Booking templates
- Advanced filtering
- Booking analytics
- Email notifications
- Integration with channel managers

---

Built with ❤️ following best practices for maintainability and user experience.

