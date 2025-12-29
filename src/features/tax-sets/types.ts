/**
 * Tax Sets Type Definitions
 * 
 * Tax sets are collections of taxes that can be applied to rate plans.
 * Each tax set belongs to a company and property, and uses UUID as primary key.
 * 
 * ⚠️ UPDATED: Tax sets now directly reference taxes via the `taxes` array.
 * The old tax-set-items module has been removed.
 */

import type { Tax } from '@/features/taxes/types';

/**
 * Reference to a tax when creating/updating a tax set
 */
export interface TaxReference {
  id: string;      // UUID of existing tax
  level?: number;  // Order/priority for calculation, default: 0
}

/**
 * Tax association in tax set response
 */
export interface TaxSetTax {
  taxSetId: string;
  taxId: string;
  level: number;
  tax: Tax;  // Full tax object
}

export interface TaxSet {
  id: string; // UUID (36 characters)
  companyId: number;
  propertyId: string; // UUID
  property?: {
    id: string;
    title: string;
  };
  company?: {
    id: number;
    name: string;
  };
  title: string;
  currency: string; // ISO 4217 currency code (exactly 3 uppercase letters: USD, EUR, GBP, etc.)
  status: number; // 0 = inactive, 1 = active
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  taxSetTaxes?: TaxSetTax[]; // Array of associated taxes
}

/**
 * ⚠️ CRITICAL: When creating a tax set, DO NOT include:
 * - companyId (automatically set from JWT token)
 * - id (auto-generated UUID)
 * - createdAt (auto-generated)
 * - updatedAt (auto-generated)
 * 
 * NEW: You can now include taxes directly in the create request.
 * Taxes must exist first - create them via POST /taxes before referencing them.
 */
export interface CreateTaxSetPayload {
  propertyId: string; // UUID, required
  title: string; // Required
  currency: string; // Required, ISO 4217 currency code (exactly 3 uppercase letters)
  status?: number; // Optional, default: 1
  taxes?: TaxReference[]; // Optional array of tax references
}

/**
 * ⚠️ CRITICAL: When updating a tax set, DO NOT include:
 * - companyId (cannot be changed)
 * - id (cannot be changed)
 * - createdAt (cannot be changed)
 * - updatedAt (auto-updated)
 * 
 * ⚠️ IMPORTANT: When updating `taxes`, the existing taxes are REPLACED
 * with the new array. To keep existing taxes, include them in the request.
 */
export interface UpdateTaxSetPayload {
  propertyId?: string; // UUID
  title?: string;
  currency?: string; // ISO 4217 currency code (exactly 3 uppercase letters)
  status?: number;
  taxes?: TaxReference[]; // When provided, replaces all existing tax associations
}

export interface PaginatedTaxSetsResponse {
  data: TaxSet[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TaxSetQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  propertyId?: string; // Filter by property ID
}
