// Date Range for Advance Policy
export interface ReservationAdvancePolicyDateRange {
  id: number;
  policyId: string;
  dateAfter: string; // ISO date string
  dateBefore: string; // ISO date string
  createdAt?: string;
  updatedAt?: string;
}

// Create DTO
export interface CreateReservationAdvancePolicyDateRangeDto {
  policyId: string;
  dateAfter: string; // ISO date string
  dateBefore: string; // ISO date string
}

// Update DTO
export interface UpdateReservationAdvancePolicyDateRangeDto {
  policyId?: string;
  dateAfter?: string;
  dateBefore?: string;
}

