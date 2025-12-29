/**
 * Properties Type Definitions
 * 
 * Properties are hotels, resorts, or accommodation establishments managed by a company.
 * Each property belongs to a company and uses UUID as primary key.
 */

export interface Property {
  id: string; // UUID (36 characters)
  companyId: number;
  title: string;
  currency: string; // ISO 4217 currency code (exactly 3 uppercase letters: USD, EUR, GBP, etc.)
  email?: string;
  phone?: string;
  zipCode?: string;
  country?: string; // ISO 3166-1 alpha-2 country code (exactly 2 uppercase letters: US, FR, GB, etc.)
  state?: string;
  city?: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  timezone?: string; // IANA timezone (e.g., "America/Los_Angeles")
  propertyType?: string; // e.g., "hotel", "resort", "apartment", "villa"
  groupId?: string; // UUID for grouping related properties
  logoUrl?: string;
  website?: string;
  isActive?: boolean; // Automatically set by backend on creation
  sendData?: boolean; // Automatically set by backend on creation
  channexWebhookId?: string; // UUID of Channex webhook for this property
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  company?: {
    id: number;
    name: string;
    email: string;
  };
}

/**
 * ⚠️ CRITICAL: When creating a property, DO NOT include:
 * - companyId (automatically set from JWT token)
 * - id (auto-generated UUID)
 * - createdAt (auto-generated)
 * - updatedAt (auto-generated)
 * 
 * If you send companyId, you'll get: "property companyId should not exist"
 */
export interface CreatePropertyPayload {
  title: string; // Required
  currency: string; // Required, ISO 4217 currency code (exactly 3 uppercase letters)
  email?: string;
  phone?: string;
  zipCode?: string;
  country?: string; // ISO 3166-1 alpha-2 country code (exactly 2 uppercase letters)
  state?: string;
  city?: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  timezone?: string;
  propertyType?: string;
  groupId?: string; // UUID
  logoUrl?: string;
  website?: string;
}

/**
 * ⚠️ CRITICAL: When updating a property, DO NOT include:
 * - companyId (cannot be changed)
 * - id (cannot be changed)
 * - createdAt (cannot be changed)
 * - updatedAt (auto-updated)
 */
export interface UpdatePropertyPayload {
  title?: string;
  currency?: string; // ISO 4217 currency code (exactly 3 uppercase letters)
  email?: string;
  phone?: string;
  zipCode?: string;
  country?: string; // ISO 3166-1 alpha-2 country code (exactly 2 uppercase letters)
  state?: string;
  city?: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  timezone?: string;
  propertyType?: string;
  groupId?: string; // UUID
  logoUrl?: string;
  website?: string;
  channexWebhookId?: string; // UUID of Channex webhook for this property
  isActive?: boolean; // Property active status for Channex sync
  sendData?: boolean; // Whether to send data to Channex
}

export interface PaginatedPropertiesResponse {
  data: Property[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PropertyQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  groupId?: string; // Filter properties by group ID
}

export interface PropertyLocationFilter {
  country?: string;
  state?: string;
  city?: string;
}

