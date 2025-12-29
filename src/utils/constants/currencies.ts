/**
 * ISO 4217 Currency Codes
 * 
 * This list contains currency codes following the ISO 4217 international standard.
 * ISO 4217 defines three-letter codes for currencies worldwide.
 * 
 * Reference: https://www.iso.org/iso-4217-currency-codes.html
 * 
 * Each currency code is exactly 3 uppercase letters (e.g., USD, EUR, GBP).
 */
export const CURRENCY_CODES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'MAD', name: 'Moroccan Dirham' },
] as const;

/**
 * Valid ISO 4217 currency codes as a set for quick lookup
 */
export const ISO_4217_CURRENCY_CODES = new Set(
  CURRENCY_CODES.map((currency) => currency.code)
);

/**
 * Validates if a currency code is a valid ISO 4217 code
 * @param code - The currency code to validate (case-insensitive)
 * @returns true if the code is a valid ISO 4217 currency code
 */
export function isValidISO4217Currency(code: string): boolean {
  if (!code || code.length !== 3) {
    return false;
  }
  return ISO_4217_CURRENCY_CODES.has(code.toUpperCase());
}

