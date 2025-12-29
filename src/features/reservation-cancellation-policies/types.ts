// Enums for Cancellation Policy fields
export type PenaltyLogic = 'percent' | 'amount' | 'nights';
export type NoShowPenaltyLogic = 'percent' | 'amount' | 'nights';

// Date Range for Cancellation Policy
export interface ReservationCancellationPolicyDateRange {
  id: number;
  policyId: string;
  dateAfter: string; // ISO date string
  dateBefore: string; // ISO date string
  createdAt?: string;
  updatedAt?: string;
}

// Main Cancellation Policy entity
export interface ReservationCancellationPolicy {
  id: string;
  propertyId: string;
  ratePlanId: string | null;
  title: string;
  description: string | null;
  isRefundable: boolean;
  freeCancellationDays: number | null;
  penaltyLogic: PenaltyLogic;
  penaltyValue: number;
  noShowPenaltyLogic: NoShowPenaltyLogic | null;
  noShowPenaltyValue: number | null;
  minNights: number | null;
  maxNights: number | null;
  createdAt: string;
  updatedAt: string;
  dateRanges?: ReservationCancellationPolicyDateRange[];
}

// Create DTO
export interface CreateReservationCancellationPolicyDto {
  propertyId: string;
  ratePlanId?: string | null;
  title: string;
  description?: string | null;
  isRefundable: boolean;
  freeCancellationDays?: number | null;
  penaltyLogic: PenaltyLogic;
  penaltyValue: number;
  noShowPenaltyLogic?: NoShowPenaltyLogic | null;
  noShowPenaltyValue?: number | null;
  minNights?: number | null;
  maxNights?: number | null;
}

// Update DTO
export interface UpdateReservationCancellationPolicyDto {
  propertyId?: string;
  ratePlanId?: string | null;
  title?: string;
  description?: string | null;
  isRefundable?: boolean;
  freeCancellationDays?: number | null;
  penaltyLogic?: PenaltyLogic;
  penaltyValue?: number;
  noShowPenaltyLogic?: NoShowPenaltyLogic | null;
  noShowPenaltyValue?: number | null;
  minNights?: number | null;
  maxNights?: number | null;
}

