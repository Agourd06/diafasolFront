# Properties Feature

This feature manages properties (hotels, resorts, and accommodation establishments) in the DiafaSol ERP system.

## 📋 Overview

Properties are the core entities in the system, representing hotels, resorts, or any accommodation establishments. Each property:
- Belongs to a company (automatically scoped by JWT token)
- Uses UUID as primary key
- Can have location data (coordinates, timezone, address)
- Supports multiple currencies and property types
- Can be grouped using optional groupId

## 🗂️ File Structure

```
properties/
├── components/
│   ├── PropertyForm.tsx          # Form for creating/editing properties
│   ├── PropertyTable.tsx         # Table displaying properties with actions
│   └── PropertyDetailsModal.tsx  # Modal showing full property details
├── hooks/
│   ├── useProperties.ts          # Fetch paginated properties
│   ├── usePropertySearch.ts      # Search properties
│   ├── usePropertyById.ts        # Fetch single property
│   ├── useCreateProperty.ts      # Create property mutation
│   ├── useUpdateProperty.ts      # Update property mutation
│   ├── useDeleteProperty.ts      # Delete property mutation
│   └── usePropertyLocationFilter.ts # Filter by location
├── pages/
│   ├── PropertiesList.tsx        # Main list page with search & pagination
│   ├── CreateProperty.tsx        # Create property page
│   └── EditProperty.tsx          # Edit property page
├── types.ts                       # TypeScript interfaces
├── index.ts                       # Public exports
└── README.md                      # This file
```

## 🔌 API Endpoints

All endpoints are defined in `src/api/properties.api.ts`:

1. **GET /api/properties** - Get paginated properties
2. **GET /api/properties/search?q=term** - Search properties
3. **GET /api/properties/filter?country=US&state=CA** - Filter by location
4. **GET /api/properties/:id** - Get single property
5. **POST /api/properties** - Create property
6. **PATCH /api/properties/:id** - Update property
7. **DELETE /api/properties/:id** - Delete property

## 📝 Data Model

### Property Interface

```typescript
interface Property {
  id: string;                    // UUID (36 characters)
  companyId: number;             // Automatically set from token
  title: string;                 // Required
  currency: string;              // Required, ISO 4217 currency code (exactly 3 uppercase letters)
  email?: string;
  phone?: string;
  zipCode?: string;
  country?: string;             // ISO 3166-1 alpha-2 country code (exactly 2 uppercase letters)
  state?: string;
  city?: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  timezone?: string;            // IANA timezone
  propertyType?: string;        // e.g., "hotel", "resort"
  groupId?: string;             // UUID for grouping
  logoUrl?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Validation Rules

- **title**: Required, max 255 characters
- **currency**: Required, ISO 4217 currency code (exactly 3 uppercase letters: USD, EUR, GBP, etc.)
- **email**: Optional, valid email format
- **phone**: Optional, max 50 characters
- **country**: Optional, ISO 3166-1 alpha-2 country code (exactly 2 uppercase letters: US, FR, GB, etc.)
- **state**: Optional, max 100 characters
- **city**: Optional, max 100 characters
- **address**: Optional, max 255 characters
- **zipCode**: Optional, max 20 characters
- **longitude**: Optional, -180 to 180
- **latitude**: Optional, -90 to 90
- **timezone**: Optional, max 64 characters (IANA format)
- **propertyType**: Optional, max 50 characters
- **logoUrl**: Optional, valid URL, max 255 characters
- **website**: Optional, valid URL, max 255 characters
- **groupId**: Optional, valid UUID

## 🎨 Components

### PropertyForm

Comprehensive form with collapsible sections:
- **Basic Information**: title, currency, property type, email, phone
- **Location**: country, state, city, zip code, address
- **Coordinates & Timezone**: longitude, latitude, timezone
- **Additional**: logo URL, website, group ID

Features:
- Client-side validation
- Currency selector (6 currencies: USD, EUR, GBP, JPY, CNY, MAD)
- Country selector (40+ countries)
- Timezone selector (50+ timezones)
- Property type selector (22 types)
- Collapsible sections for optional fields

### PropertyTable

Displays properties in a responsive table with:
- Logo thumbnail (if available)
- Title with website link
- Currency badge
- Property type badge
- Location (city, state, country)
- Contact info (email, phone)
- Action buttons (view, edit, delete)

### PropertyDetailsModal

Full-screen modal showing:
- Property logo
- Basic information
- Contact details
- Location information
- GPS coordinates
- Group information
- Metadata (ID, timestamps)

## 🔧 Usage Examples

### List Properties

```tsx
import { PropertiesList } from '@/features/properties';

function App() {
  return <PropertiesList />;
}
```

### Create Property

```tsx
import { CreateProperty } from '@/features/properties';

function App() {
  return <CreateProperty />;
}
```

### Edit Property

```tsx
import { EditProperty } from '@/features/properties';

function App() {
  return <EditProperty />;
}
```

### Using Hooks

```tsx
import { useProperties, useCreateProperty } from '@/features/properties';

function MyComponent() {
  // Fetch properties
  const { data, isLoading } = useProperties({
    page: 1,
    limit: 10,
    search: 'hotel',
    sortBy: 'title',
    sortOrder: 'ASC'
  });

  // Create property
  const createMutation = useCreateProperty();
  
  const handleCreate = async () => {
    await createMutation.mutateAsync({
      title: 'Grand Hotel',
      currency: 'USD',
      email: 'hotel@example.com',
      city: 'Los Angeles',
      country: 'US'
    });
  };
}
```

## 🌍 Internationalization

All text is translated in:
- `src/i18n/locales/fr.json` (French)
- `src/i18n/locales/en.json` (English)

Translation keys are under `properties.*`:
- `properties.title`
- `properties.form.*`
- `properties.table.*`
- `properties.details.*`
- `properties.validation.*`

## 🚨 Important Notes

### ⚠️ DO NOT Send companyId

When creating or updating properties, **NEVER** include `companyId` in the request payload. It's automatically extracted from the JWT token. Sending it will result in:

```
"property companyId should not exist"
```

### ✅ Correct Create Payload

```typescript
{
  title: 'Grand Hotel',
  currency: 'USD',
  email: 'hotel@example.com',
  // ... other fields
  // ❌ DO NOT include: companyId, id, createdAt, updatedAt
}
```

## 🔗 Routes

Properties routes are defined in `src/routes/AppRoutes.tsx`:

- `/properties` - List all properties
- `/properties/create` - Create new property
- `/properties/edit/:id` - Edit existing property

The root route (`/`) redirects to `/properties` for authenticated users.

## 🎯 Features

- ✅ Full CRUD operations
- ✅ Pagination (10 items per page)
- ✅ Search (by name, city, country, etc.)
- ✅ Location filtering (country, state, city)
- ✅ Sorting
- ✅ Rich form with validation
- ✅ Currency selector (ISO 4217 compliant)
- ✅ Country selector (ISO 3166-1 alpha-2 compliant)
- ✅ Timezone selector
- ✅ Property type selector
- ✅ Image support (logo URL)
- ✅ GPS coordinates
- ✅ Group management
- ✅ Delete confirmation modal
- ✅ View details modal
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ Internationalization (FR/EN)

## 🔄 Related Features

Properties can be related to:
- Room Types
- Rate Plans
- Facilities (via junction table)
- Property Content
- Property Photos
- Property Settings
- Taxes

## 📚 Constants

Predefined constants are available in `src/utils/constants/`:

- `currencies.ts` - 6 ISO 4217 currency codes (USD, EUR, GBP, JPY, CNY, MAD)
- `countries.ts` - 40+ ISO 3166-1 alpha-2 country codes
- `timezones.ts` - 50+ IANA timezones
- `timezones.ts` - 22 property types

## 🧪 Testing

To test the properties feature:

1. Start the backend server
2. Login to the application
3. Navigate to "Propriétés" in the sidebar
4. Test CRUD operations:
   - Create a new property
   - Search for properties
   - Edit a property
   - View property details
   - Delete a property
5. Test validation:
   - Try submitting without required fields
   - Test invalid email/URL formats
   - Test coordinate ranges
6. Test internationalization:
   - Switch between French and English
   - Verify all text is translated

## 🐛 Troubleshooting

### Error: "property companyId should not exist"
**Solution**: Remove `companyId` from your request payload. It's automatically set from the JWT token.

### Error: "currency must be exactly 3 characters" or "currency is invalid"
**Solution**: Use valid ISO 4217 currency codes (USD, EUR, GBP, etc.). The currency must be exactly 3 uppercase letters and must be in the supported list.

### Error: "country must be exactly 2 characters" or "country is invalid"
**Solution**: Use valid ISO 3166-1 alpha-2 country codes (US, FR, GB, etc.). The country must be exactly 2 uppercase letters and must be in the supported list.

### Property not found (404)
**Possible causes**:
- Invalid UUID format
- Property doesn't exist
- Property belongs to a different company

## 📖 Additional Resources

- Backend API Guide: See the original properties API documentation
- Currency Codes: [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217)
- Country Codes: [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)
- Timezones: [IANA Time Zone Database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

