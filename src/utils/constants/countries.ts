/**
 * ISO 3166-1 Alpha-2 Country Codes
 * 
 * This list contains country codes following the ISO 3166-1 alpha-2 international standard.
 * ISO 3166-1 alpha-2 defines two-letter codes for countries worldwide.
 * 
 * Reference: https://www.iso.org/iso-3166-country-codes.html
 * 
 * Each country code is exactly 2 uppercase letters (e.g., US, FR, GB).
 */
export const COUNTRY_CODES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'RU', name: 'Russia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'SG', name: 'Singapore' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'AT', name: 'Austria' },
  { code: 'DK', name: 'Denmark' },
  { code: 'NO', name: 'Norway' },
  { code: 'FI', name: 'Finland' },
  { code: 'IE', name: 'Ireland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GR', name: 'Greece' },
  { code: 'TR', name: 'Turkey' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'MA', name: 'Morocco' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'EG', name: 'Egypt' },
  { code: 'TH', name: 'Thailand' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'KR', name: 'South Korea' },
] as const;

/**
 * Valid ISO 3166-1 alpha-2 country codes as a set for quick lookup
 */
export const ISO_3166_1_COUNTRY_CODES = new Set(
  COUNTRY_CODES.map((country) => country.code)
);

/**
 * Validates if a country code is a valid ISO 3166-1 alpha-2 code
 * @param code - The country code to validate (case-insensitive)
 * @returns true if the code is a valid ISO 3166-1 alpha-2 country code
 */
export function isValidISO31661Country(code: string): boolean {
  if (!code || code.length !== 2) {
    return false;
  }
  return ISO_3166_1_COUNTRY_CODES.has(code.toUpperCase());
}

