// Date Range for Cancellation Policy
export interface ReservationCancellationPolicyDateRange {
  id: number;
  policyId: string;
  dateAfter: string; // ISO date string
  dateBefore: string; // ISO date string
  createdAt?: string;
  updatedAt?: string;
}

// Create DTO
export interface CreateReservationCancellationPolicyDateRangeDto {
  policyId: string;
  dateAfter: string; // ISO date string
  dateBefore: string; // ISO date string
}

// Update DTO
export interface UpdateReservationCancellationPolicyDateRangeDto {
  policyId?: string;
  dateAfter?: string;
  dateBefore?: string;
}

