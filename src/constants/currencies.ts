/**
 * Currency Constants
 * 
 * ISO 4217 currency codes used throughout the application
 */

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.' },
];

/**
 * Get currency symbol by code
 */
export const getCurrencySymbol = (code: string): string => {
  const currency = CURRENCIES.find(c => c.code === code);
  return currency?.symbol || code;
};

/**
 * Get currency name by code
 */
export const getCurrencyName = (code: string): string => {
  const currency = CURRENCIES.find(c => c.code === code);
  return currency?.name || code;
};

/**
 * Format amount with currency
 */
export const formatCurrency = (amount: number | string | null | undefined, currencyCode: string): string => {
  const symbol = getCurrencySymbol(currencyCode);
  
  // Handle null, undefined, or invalid values
  if (amount === null || amount === undefined || amount === '') {
    return `${symbol} 0.00`;
  }
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle NaN or invalid numbers
  if (isNaN(numAmount)) {
    return `${symbol} 0.00`;
  }
  
  // Format with 2 decimal places
  const formatted = numAmount.toFixed(2);
  
  // Return with symbol
  return `${symbol} ${formatted}`;
};


