export const TAX_TYPE_OPTIONS = [
  { value: 'tax', label: 'Tax' },
  { value: 'fee', label: 'Fee' },
  { value: 'city_tax', label: 'City Tax' },
] as const;

/**
 * Valid tax type values as a set for quick lookup
 */
export const VALID_TAX_TYPE_VALUES = new Set(
  TAX_TYPE_OPTIONS.map((option) => option.value)
);

/**
 * Validates if a tax type value is valid
 * @param value - The tax type value to validate
 * @returns true if the value is a valid tax type
 */
export function isValidTaxType(value: string): boolean {
  return VALID_TAX_TYPE_VALUES.has(value);
}
