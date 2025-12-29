/**
 * Tax Applicable Date Range Entity
 */
export interface TaxApplicableDateRange {
  id: number;                    // bigint
  taxId: string;                 // UUID
  companyId: number;             // Auto-set, don't send
  dateAfter: string;             // Date string (YYYY-MM-DD)
  dateBefore: string;            // Date string (YYYY-MM-DD)
  createdAt: string;             // ISO date string
  updatedAt: string;             // ISO date string
}

/**
 * Create Tax Applicable Date Range Request Payload
 */
export interface CreateTaxApplicableDateRangePayload {
  taxId: string;                 // UUID, required
  dateAfter: string;             // Required, format: YYYY-MM-DD
  dateBefore: string;            // Required, format: YYYY-MM-DD
}

/**
 * Update Tax Applicable Date Range Request Payload
 */
export interface UpdateTaxApplicableDateRangePayload {
  taxId?: string;
  dateAfter?: string;
  dateBefore?: string;
}

/**
 * Query parameters for fetching tax applicable date ranges
 */
export interface TaxApplicableDateRangeQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

/**
 * Paginated response for tax applicable date ranges
 */
export interface PaginatedTaxApplicableDateRangesResponse {
  data: TaxApplicableDateRange[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

