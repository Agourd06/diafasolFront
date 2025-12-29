# DiafaSol ERP - Frontend Architecture

## Overview
This is a modern ERP system for tourism management built with React, TypeScript, and Tailwind CSS.

## Key Features

### 🔐 Authentication System
- JWT-based authentication
- Company-scoped multi-tenant system
- Login and Register pages with bilingual support (FR/EN)
- Automatic theme application from company branding

### 🎨 Dynamic Theming
- Database-driven color schemes per company
- CSS custom properties for real-time theme switching
- Automatic shade generation from primary color

### 🌍 Internationalization (i18n)
- Full bilingual support: French (default) & English
- Language switcher in navbar
- Persistent language preference in localStorage
- All UI elements translated

### 📱 Layout Structure

#### Navbar (Top)
- **Left:** Hamburger menu + Logo
- **Right:** User info + Language switcher + Logout button
- Fixed position, always visible
- Mobile-responsive with icon-only logout on small screens

#### Sidebar (Collapsible)
- **Title:** "Paramètres" (Settings)
- **Content:** Navigation menu for resource management
- **Behavior:**
  - Desktop: Always visible, can be toggled
  - Mobile: Hidden by default, slides in with overlay
- **Position:** Fixed left, full height below navbar

#### Main Content
- Automatically adjusts padding based on sidebar state
- Responsive container with proper spacing
- Contains all page content (Companies, etc.)

## Folder Structure

```
src/
├── api/                    # API client and endpoints
│   ├── axiosClient.ts     # Axios configuration with interceptors
│   ├── auth.api.ts        # Authentication API calls
│   └── companies.api.ts   # Companies API calls
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.tsx  # Main authenticated layout
│   │   └── Sidebar.tsx          # Collapsible sidebar component
│   ├── ui/                      # Reusable UI components
│   ├── LanguageSwitcher.tsx    # Language toggle button
│   ├── Logo.tsx                # App logo
│   ├── Loader.tsx              # Loading spinner
│   └── ProtectedRoute.tsx      # Route guard
├── context/
│   └── AuthContext.tsx    # Authentication state management
├── features/              # Feature-based organization
│   ├── auth/             # Authentication feature
│   │   ├── pages/        # Login, Register
│   │   ├── hooks/        # useLogin, useRegister
│   │   └── types.ts      # Auth type definitions
│   └── companies/        # Companies feature
│       ├── pages/        # List, Create
│       ├── components/   # CompanyTable, CompanyForm
│       ├── hooks/        # useCompanies, useCreateCompany
│       └── types.ts      # Company type definitions
├── hooks/                # Global hooks
│   └── useAuth.ts        # Authentication hook
├── i18n/                 # Internationalization
│   ├── config.ts         # i18next configuration
│   └── locales/
│       ├── fr.json       # French translations
│       └── en.json       # English translations
├── routes/
│   └── AppRoutes.tsx     # Application routing
├── styles/
│   └── index.css         # Global styles and animations
├── utils/                # Utility functions
│   ├── constants.ts      # App constants
│   ├── storage.ts        # LocalStorage helpers
│   ├── theme.ts          # Dynamic theming utilities
│   └── validation.ts     # Form validation helpers
└── index.tsx             # App entry point
```

## Routing Strategy

### Public Routes
- `/login` - Login page
- `/register` - Registration page

### Protected Routes
All routes require authentication and use DashboardLayout:
- `/` - Redirects to `/companies` if authenticated, `/login` if not
- `/companies` - List all operators
- `/companies/create` - Create new operator

### Route Guards
- `ProtectedRoute` component checks authentication
- Redirects to login with return path for seamless UX

## State Management

### Authentication State
- Managed by `AuthContext`
- Stores user, token, and authentication status
- Provides login, logout, and setUser methods
- Persists to localStorage

### React Query
- Handles all server state
- Automatic caching and refetching
- Optimistic updates
- DevTools for debugging

## Styling Approach

### Tailwind CSS
- Utility-first CSS framework
- Custom brand colors via CSS variables
- Responsive design utilities
- Custom animations in global CSS

### Custom Animations
- `animate-fade-in` - Fade in effect
- `animate-slide-up` - Slide up from bottom
- `animate-slide-down` - Expand/collapse
- `animate-shake` - Error shake effect

## Best Practices

1. **Component Organization**
   - Feature-based folder structure
   - Colocate related files
   - Separate layout from feature components

2. **Type Safety**
   - Full TypeScript coverage
   - Strict type checking enabled
   - Shared types in feature folders

3. **Code Splitting**
   - Route-based code splitting
   - Lazy loading for better performance

4. **Accessibility**
   - Semantic HTML
   - ARIA labels for interactive elements
   - Keyboard navigation support

5. **Performance**
   - React Query for data caching
   - Optimistic UI updates
   - CSS animations over JS

## Environment Variables

```env
VITE_API_BASE_URL=/api  # API base URL (defaults to /api for dev proxy)
```

## Development Flow

1. **Start dev server:** `npm run dev`
2. **Build for production:** `npm run build`
3. **Preview production build:** `npm run preview`

## Next Steps

### Planned Features
1. ✅ Authentication system
2. ✅ Dynamic theming
3. ✅ Internationalization
4. ✅ Collapsible sidebar layout
5. 🔄 Resource management pages (in progress)
6. ⏳ User management
7. ⏳ Role-based permissions
8. ⏳ Dashboard analytics
9. ⏳ Settings page

## Security Considerations

- JWT tokens stored in localStorage
- Automatic token refresh on 401 errors
- Company-scoped data isolation
- HTTPS required in production
- XSS protection via React
- CSRF protection via axios

