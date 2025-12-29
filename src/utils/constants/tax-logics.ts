export const TAX_LOGIC_OPTIONS = [
  { value: 'percent', label: 'Percent' },
  { value: 'per_room', label: 'Per Room' },
  { value: 'per_room_per_night', label: 'Per Room Per Night' },
  { value: 'per_person', label: 'Per Person' },
  { value: 'per_person_per_night', label: 'Per Person Per Night' },
  { value: 'per_night', label: 'Per Night' },
  { value: 'per_booking', label: 'Per Booking' },
] as const;

/**
 * Valid tax logic values as a set for quick lookup
 */
export const VALID_TAX_LOGIC_VALUES = new Set(
  TAX_LOGIC_OPTIONS.map((option) => option.value)
);

/**
 * Validates if a tax logic value is valid
 * @param value - The tax logic value to validate
 * @returns true if the value is a valid tax logic
 */
export function isValidTaxLogic(value: string): boolean {
  return VALID_TAX_LOGIC_VALUES.has(value);
}
