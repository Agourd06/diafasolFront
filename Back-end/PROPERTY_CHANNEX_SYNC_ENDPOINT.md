# Property Channex Sync Endpoint Specification

## Endpoint

```
GET /api/properties/:id/channex-sync
```

**Authentication:** JWT token required (companyId extracted from token)

**Purpose:** Returns property data with all related settings, content, and photos in Channex API format, ready to be sent to Channex.

---

## Response Structure

The endpoint should return data in **exact Channex format**:

```json
{
  "property": {
    "title": "Demo Hotel",
    "currency": "GBP",
    "email": "hotel@channex.io",
    "phone": "01267237037",
    "zip_code": "SA23 2JH",
    "country": "GB",
    "state": "Demo State",
    "city": "Demo Town",
    "address": "Demo Street",
    "longitude": "-0.2416781",
    "latitude": "51.5285582",
    "timezone": "Europe/London",
    "property_type": "hotel",
    "group_id": "f5338935-7fe0-40eb-9d7e-4dbf7ecc52c7",
    "logo_url": "https://hotel.domain/logo.png",
    "website": "https://some-hotel-website.com",
    "settings": {
      "allow_availability_autoupdate_on_confirmation": true,
      "allow_availability_autoupdate_on_modification": false,
      "allow_availability_autoupdate_on_cancellation": false,
      "min_stay_type": "both",
      "min_price": null,
      "max_price": null,
      "state_length": 500,
      "cut_off_time": "00:00:00",
      "cut_off_days": 0,
      "max_day_advance": null
    },
    "content": {
      "description": "Some Property Description Text",
      "photos": [
        {
          "url": "https://img.channex.io/af08bc1d-8074-476c-bdb7-cec931edaf6a/",
          "position": 0,
          "author": "Author Name",
          "kind": "photo",
          "description": "Room View"
        }
      ],
      "important_information": "Some important notes about property"
    }
  }
}
```

---

## Database Tables to Join

### Main Table: `properties` (or `property`)

**Fields needed:**
- `id` (UUID) - Property ID
- `title` (VARCHAR) - Property name
- `currency` (VARCHAR) - ISO 4217 currency code (3 uppercase letters)
- `email` (VARCHAR, nullable)
- `phone` (VARCHAR, nullable)
- `zip_code` (VARCHAR, nullable) - Note: Channex uses `zip_code`, our frontend uses `zipCode`
- `country` (VARCHAR, nullable) - ISO 3166-1 alpha-2 (2 uppercase letters)
- `state` (VARCHAR, nullable)
- `city` (VARCHAR, nullable)
- `address` (VARCHAR, nullable)
- `longitude` (DECIMAL, nullable) - Convert to string
- `latitude` (DECIMAL, nullable) - Convert to string
- `timezone` (VARCHAR, nullable) - IANA timezone
- `property_type` (VARCHAR, nullable) - Map to Channex format (see mapping below)
- `group_id` (UUID, nullable)
- `logo_url` (VARCHAR, nullable) - Note: Channex uses `logo_url`, our frontend uses `logoUrl`
- `website` (VARCHAR, nullable)

### Table 2: `properties_settings` (or `property_settings`) - LEFT JOIN

**Join condition:**
```sql
LEFT JOIN properties_settings ps ON ps.property_id = p.id
```

**Fields needed:**
- `property_id` (UUID, FK)
- `allow_availability_autoupdate_on_confirmation` (BOOLEAN/TINYINT, nullable)
- `allow_availability_autoupdate_on_modification` (BOOLEAN/TINYINT, nullable)
- `allow_availability_autoupdate_on_cancellation` (BOOLEAN/TINYINT, nullable)
- `min_stay_type` (VARCHAR, nullable) - e.g., "both", "nights", "arrival", "through"
- `min_price` (DECIMAL, nullable)
- `max_price` (DECIMAL, nullable)
- `state_length` (INTEGER, nullable)
- `cut_off_time` (TIME/VARCHAR, nullable) - Format: "HH:MM:SS"
- `cut_off_days` (INTEGER, nullable)
- `max_day_advance` (INTEGER, nullable)

**If no settings exist:** Return `null` for the entire `settings` object, or return an object with all fields as `null`.

### Table 3: `properties_content` (or `property_content`) - LEFT JOIN

**Join condition:**
```sql
LEFT JOIN properties_content pc ON pc.property_id = p.id
```

**Fields needed:**
- `property_id` (UUID, FK)
- `description` (TEXT, nullable)
- `important_information` (TEXT, nullable) - Note: Channex uses `important_information`, our frontend uses `importantInformation`

**If no content exists:** Return `description: null` and `important_information: null`.

### Table 4: `properties_photos` (or `property_photos`) - LEFT JOIN

**Join condition:**
```sql
LEFT JOIN properties_photos pp ON pp.property_id = p.id
```

**Fields needed:**
- `property_id` (UUID, FK)
- `url` (VARCHAR) - Required
- `position` (INTEGER, nullable) - Default to 0 if null
- `author` (VARCHAR, nullable)
- `kind` (VARCHAR, nullable) - e.g., "photo", "exterior", "interior", "room", "amenity"
- `description` (TEXT, nullable)

**Aggregation:** JSON array of photos, **sorted by `position` ASC** (null positions should be treated as 0).

**If no photos exist:** Return empty array `[]`.

---

## Complete SQL Query Structure

```sql
SELECT 
  -- Property fields
  p.id,
  p.title,
  p.currency,
  p.email,
  p.phone,
  p.zip_code,
  p.country,
  p.state,
  p.city,
  p.address,
  p.longitude,
  p.latitude,
  p.timezone,
  p.property_type,
  p.group_id,
  p.logo_url,
  p.website,
  
  -- Settings fields (nullable)
  ps.allow_availability_autoupdate_on_confirmation,
  ps.allow_availability_autoupdate_on_modification,
  ps.allow_availability_autoupdate_on_cancellation,
  ps.min_stay_type,
  ps.min_price,
  ps.max_price,
  ps.state_length,
  ps.cut_off_time,
  ps.cut_off_days,
  ps.max_day_advance,
  
  -- Content fields (nullable)
  pc.description,
  pc.important_information,
  
  -- Photos (will be aggregated)
  pp.id as photo_id,
  pp.url as photo_url,
  pp.position as photo_position,
  pp.author as photo_author,
  pp.kind as photo_kind,
  pp.description as photo_description

FROM properties p
LEFT JOIN properties_settings ps ON ps.property_id = p.id
LEFT JOIN properties_content pc ON pc.property_id = p.id
LEFT JOIN properties_photos pp ON pp.property_id = p.id
WHERE p.id = :propertyId
  AND p.company_id = :companyId  -- From JWT token
ORDER BY pp.position ASC NULLS LAST, pp.id ASC
```

---

## Data Transformation Rules

### 1. Property Type Mapping

Map your property types to Channex format:
- `hotel` → `hotel`
- `resort` → `resort`
- `apartment` → `apartment`
- `villa` → `villa`
- `holiday_home` → `holiday_home`
- `vacation_rental` → `vacation_rental`
- (any other value) → use as-is or default to `hotel`

### 2. Coordinates

- `longitude` and `latitude` must be converted to **strings** (not numbers)
- Format: `"-0.2416781"` (with quotes in JSON)

### 3. Settings Object

- If settings record exists: Include all fields (use `null` for nullable fields that are not set)
- If no settings record: Return `settings: null` OR return object with all fields as `null`

### 4. Content Object

**Structure:**
```json
{
  "description": "string or null",
  "important_information": "string or null",
  "photos": [] // Array of photo objects (see below)
}
```

**If no content record exists:**
- `description: null`
- `important_information: null`
- `photos: []` (empty array, populated from photos table)

### 5. Photos Array

**Structure:**
```json
{
  "url": "string (required)",
  "position": 0, // number, default 0 if null
  "author": "string or null",
  "kind": "string or null",
  "description": "string or null"
}
```

**Rules:**
- Sort by `position` ASC (null positions = 0)
- If no photos: return empty array `[]`
- All fields except `url` are optional

### 6. Null Handling

- **Nullable fields:** Return `null` (not empty string `""` or `undefined`)
- **Required fields:** Must have a value (e.g., `title`, `currency`)
- **Arrays:** Return empty array `[]` if no records exist

---

## Response Format

### Success Response (200 OK)

```json
{
  "property": {
    "title": "Demo Hotel",
    "currency": "GBP",
    "email": "hotel@channex.io",
    "phone": "01267237037",
    "zip_code": "SA23 2JH",
    "country": "GB",
    "state": "Demo State",
    "city": "Demo Town",
    "address": "Demo Street",
    "longitude": "-0.2416781",
    "latitude": "51.5285582",
    "timezone": "Europe/London",
    "property_type": "hotel",
    "group_id": "f5338935-7fe0-40eb-9d7e-4dbf7ecc52c7",
    "logo_url": "https://hotel.domain/logo.png",
    "website": "https://some-hotel-website.com",
    "settings": {
      "allow_availability_autoupdate_on_confirmation": true,
      "allow_availability_autoupdate_on_modification": false,
      "allow_availability_autoupdate_on_cancellation": false,
      "min_stay_type": "both",
      "min_price": null,
      "max_price": null,
      "state_length": 500,
      "cut_off_time": "00:00:00",
      "cut_off_days": 0,
      "max_day_advance": null
    },
    "content": {
      "description": "Some Property Description Text",
      "photos": [
        {
          "url": "https://img.channex.io/af08bc1d-8074-476c-bdb7-cec931edaf6a/",
          "position": 0,
          "author": "Author Name",
          "kind": "photo",
          "description": "Room View"
        }
      ],
      "important_information": "Some important notes about property"
    }
  }
}
```

### Error Responses

**404 Not Found:**
```json
{
  "error": "Property not found"
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden (property belongs to different company):**
```json
{
  "error": "Forbidden: Property does not belong to your company"
}
```

---

## Field Name Mapping (Our DB → Channex)

| Our Database Field | Channex API Field | Notes |
|-------------------|-------------------|-------|
| `zip_code` | `zip_code` | Same |
| `logo_url` | `logo_url` | Same |
| `property_type` | `property_type` | Same (but map values) |
| `group_id` | `group_id` | Same |
| `important_information` | `important_information` | Same |
| `allow_availability_autoupdate_on_confirmation` | `allow_availability_autoupdate_on_confirmation` | Same |
| `allow_availability_autoupdate_on_modification` | `allow_availability_autoupdate_on_modification` | Same |
| `allow_availability_autoupdate_on_cancellation` | `allow_availability_autoupdate_on_cancellation` | Same |
| `min_stay_type` | `min_stay_type` | Same |
| `min_price` | `min_price` | Same |
| `max_price` | `max_price` | Same |
| `state_length` | `state_length` | Same |
| `cut_off_time` | `cut_off_time` | Same (format: "HH:MM:SS") |
| `cut_off_days` | `cut_off_days` | Same |
| `max_day_advance` | `max_day_advance` | Same |

---

## Implementation Notes

1. **Aggregation:** Since photos are one-to-many, you'll need to aggregate them into an array. Use JSON aggregation functions (e.g., `JSON_ARRAYAGG` in MySQL, `json_agg` in PostgreSQL).

2. **Settings:** If no settings record exists, you can either:
   - Return `settings: null`
   - Return an object with all fields as `null` (recommended for consistency)

3. **Content:** Always return the `content` object with:
   - `description` (from content table or null)
   - `important_information` (from content table or null)
   - `photos` (array from photos table, always present even if empty)

4. **Coordinates:** Ensure `longitude` and `latitude` are returned as **strings**, not numbers.

5. **Time Format:** `cut_off_time` must be in `"HH:MM:SS"` format (e.g., `"00:00:00"`, `"14:30:00"`).

6. **Boolean Fields:** Settings boolean fields should be actual booleans (`true`/`false`), not `1`/`0`.

---

## Example Query (PostgreSQL)

```sql
SELECT 
  p.id,
  p.title,
  p.currency,
  p.email,
  p.phone,
  p.zip_code,
  p.country,
  p.state,
  p.city,
  p.address,
  p.longitude::text,
  p.latitude::text,
  p.timezone,
  p.property_type,
  p.group_id,
  p.logo_url,
  p.website,
  json_build_object(
    'allow_availability_autoupdate_on_confirmation', COALESCE(ps.allow_availability_autoupdate_on_confirmation, false),
    'allow_availability_autoupdate_on_modification', COALESCE(ps.allow_availability_autoupdate_on_modification, false),
    'allow_availability_autoupdate_on_cancellation', COALESCE(ps.allow_availability_autoupdate_on_cancellation, false),
    'min_stay_type', ps.min_stay_type,
    'min_price', ps.min_price,
    'max_price', ps.max_price,
    'state_length', ps.state_length,
    'cut_off_time', ps.cut_off_time,
    'cut_off_days', ps.cut_off_days,
    'max_day_advance', ps.max_day_advance
  ) as settings,
  json_build_object(
    'description', pc.description,
    'important_information', pc.important_information,
    'photos', COALESCE(
      json_agg(
        json_build_object(
          'url', pp.url,
          'position', COALESCE(pp.position, 0),
          'author', pp.author,
          'kind', pp.kind,
          'description', pp.description
        ) ORDER BY COALESCE(pp.position, 0) ASC, pp.id ASC
      ) FILTER (WHERE pp.id IS NOT NULL),
      '[]'::json
    )
  ) as content
FROM properties p
LEFT JOIN properties_settings ps ON ps.property_id = p.id
LEFT JOIN properties_content pc ON pc.property_id = p.id
LEFT JOIN properties_photos pp ON pp.property_id = p.id
WHERE p.id = :propertyId
  AND p.company_id = :companyId
GROUP BY p.id, ps.id, pc.id
```

---

## Frontend Usage

Once implemented, the frontend will call:

```typescript
GET /api/properties/:propertyId/channex-sync
```

And receive data in Channex format that can be directly sent to Channex API:

```typescript
const response = await axiosClient.get(`/properties/${propertyId}/channex-sync`);
const channexPayload = response.data.property;
await channexClient.post('/properties', { property: channexPayload });
```
