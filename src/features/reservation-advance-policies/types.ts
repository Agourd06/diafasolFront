// Enums for Advance Policy fields
export type ChargeLogic = 'percent' | 'amount' | 'nights';
export type DueType = 'before_arrival' | 'at_booking';

// Date Range for Advance Policy
export interface ReservationAdvancePolicyDateRange {
  id: number;
  policyId: string;
  dateAfter: string; // ISO date string
  dateBefore: string; // ISO date string
  createdAt?: string;
  updatedAt?: string;
}

// Main Advance Policy entity
export interface ReservationAdvancePolicy {
  id: string;
  propertyId: string;
  ratePlanId: string | null;
  title: string;
  description: string | null;
  chargeLogic: ChargeLogic;
  chargeValue: number;
  dueType: DueType;
  dueDaysBeforeArrival: number | null;
  minNights: number | null;
  maxNights: number | null;
  createdAt: string;
  updatedAt: string;
  dateRanges?: ReservationAdvancePolicyDateRange[];
}

// Create DTO
export interface CreateReservationAdvancePolicyDto {
  propertyId: string;
  ratePlanId?: string | null;
  title: string;
  description?: string | null;
  chargeLogic: ChargeLogic;
  chargeValue: number;
  dueType: DueType;
  dueDaysBeforeArrival?: number | null;
  minNights?: number | null;
  maxNights?: number | null;
}

// Update DTO
export interface UpdateReservationAdvancePolicyDto {
  propertyId?: string;
  ratePlanId?: string | null;
  title?: string;
  description?: string | null;
  chargeLogic?: ChargeLogic;
  chargeValue?: number;
  dueType?: DueType;
  dueDaysBeforeArrival?: number | null;
  minNights?: number | null;
  maxNights?: number | null;
}

