/**
 * Planning Feature - Type Definitions
 * 
 * Types for the planning/inventory grid view that displays
 * room type availability and rate plan rates in a date-based grid.
 */

export interface PlanningAvailability {
  id: number;
  date: string; // YYYY-MM-DD
  availability: number;
}

export interface PlanningRate {
  id: number;
  date: string; // YYYY-MM-DD
  rate: number;
}

export interface PlanningRatePlan {
  id: string;
  title: string;
  code?: string;
  rates: PlanningRate[];
}

export interface PlanningRoomType {
  id: string;
  title: string;
  countOfRooms: number;
  availability: PlanningAvailability[];
  ratePlans: PlanningRatePlan[];
}

export interface PlanningResponse {
  propertyId: string;
  startDate: string;
  endDate: string;
  roomTypes: PlanningRoomType[];
}

/**
 * Cell value for editing
 */
export interface PlanningCellValue {
  type: 'availability' | 'rate';
  roomTypeId: string;
  ratePlanId?: string; // Only for rate cells
  date: string;
  value: number;
  originalValue: number | null;
}

/**
 * Planning grid row type
 */
export type PlanningRowType = 
  | { type: 'roomType'; roomType: PlanningRoomType; availability?: PlanningAvailability[] }
  | { type: 'availability'; roomTypeId: string; availability: PlanningAvailability[] }
  | { type: 'ratePlan'; roomTypeId: string; ratePlan: PlanningRatePlan };

/**
 * Planning filters
 */
export interface PlanningFilters {
  roomTypeIds?: string[];
  ratePlanIds?: string[];
}

