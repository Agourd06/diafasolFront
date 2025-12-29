# Dynamic Theme System - Usage Guide

## Overview
The app now supports dynamic theming where each company can have their own brand colors loaded from the database.

## How It Works

### 1. Database Schema
Add these optional fields to your `companies` table:
```sql
ALTER TABLE companies ADD COLUMN primaryColor VARCHAR(7);   -- e.g., "#214fd6"
ALTER TABLE companies ADD COLUMN secondaryColor VARCHAR(7); -- optional
ALTER TABLE companies ADD COLUMN accentColor VARCHAR(7);    -- optional
```

### 2. Backend Response
Include color fields in the Company entity response:
```typescript
{
  "access_token": "...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "company": {
      "id": 1,
      "name": "DiafaSol Company",
      "primaryColor": "#FF5733",      // Custom brand color
      "secondaryColor": "#33FF57",    // Optional
      "accentColor": "#3357FF"        // Optional
    }
  }
}
```

### 3. Automatic Theme Application
The theme is automatically applied when:
- User logs in (from AuthResponse)
- User reloads page (from localStorage)
- Theme is automatically reset on logout

### 4. Manual Theme Control (Optional)
You can also manually control themes:

```typescript
import { applyCompanyTheme, resetTheme } from "./utils/theme";

// Apply custom theme
applyCompanyTheme({
  primaryColor: "#FF5733"
});

// Reset to default
resetTheme();
```

## Color Management

### Backend API Endpoint (Example)
Create an endpoint for admins to update company colors:

```typescript
// PUT /api/companies/:id/theme
{
  "primaryColor": "#FF5733"
}
```

### Frontend Settings Page (Future)
You can create a settings page where admins can:
- Pick a color with a color picker
- Preview changes in real-time
- Save to database

## Technical Details

### CSS Variables
Colors are stored as RGB values in CSS custom properties:
```css
:root {
  --color-brand-600: 33 79 214; /* RGB values */
}
```

### Tailwind Integration
All `brand-*` classes automatically use these variables:
- `bg-brand-600`
- `text-brand-700`
- `border-brand-400`
- etc.

### Color Shades
The system automatically generates all 9 shades (50-900) from a single primary color.

## Example Companies with Different Themes

```typescript
// Company 1 - Blue theme (default)
primaryColor: "#214fd6"

// Company 2 - Green theme (eco-tourism)
primaryColor: "#10b981"

// Company 3 - Orange theme (adventure tourism)
primaryColor: "#f97316"

// Company 4 - Purple theme (luxury tourism)
primaryColor: "#9333ea"
```

## Browser Support
Works in all modern browsers that support CSS custom properties (IE11+).

