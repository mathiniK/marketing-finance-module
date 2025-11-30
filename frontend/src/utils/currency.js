/**
 * Currency Utility Functions
 * Supports multiple currencies - change CURRENT_CURRENCY to switch
 */

// ==================== CURRENCY CONFIGURATION ====================
// Change this to use different currency throughout the app

const CURRENCIES = {
  USD: {
    symbol: '$',
    code: 'USD',
    locale: 'en-US',
    name: 'US Dollar',
  },
  LKR: {
    symbol: 'Rs.',
    code: 'LKR',
    locale: 'en-LK',
    name: 'Sri Lankan Rupee',
  },
  EUR: {
    symbol: '€',
    code: 'EUR',
    locale: 'de-DE',
    name: 'Euro',
  },
  GBP: {
    symbol: '£',
    code: 'GBP',
    locale: 'en-GB',
    name: 'British Pound',
  },
  INR: {
    symbol: '₹',
    code: 'INR',
    locale: 'en-IN',
    name: 'Indian Rupee',
  },
  JPY: {
    symbol: '¥',
    code: 'JPY',
    locale: 'ja-JP',
    name: 'Japanese Yen',
  },
  AUD: {
    symbol: 'A$',
    code: 'AUD',
    locale: 'en-AU',
    name: 'Australian Dollar',
  },
  CAD: {
    symbol: 'C$',
    code: 'CAD',
    locale: 'en-CA',
    name: 'Canadian Dollar',
  },
};

// ⚙️ CHANGE THIS TO SWITCH CURRENCY
// Options: 'USD', 'LKR', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'
const CURRENT_CURRENCY = 'LKR';

// Get current currency configuration
const activeCurrency = CURRENCIES[CURRENT_CURRENCY] || CURRENCIES.USD;

export const CURRENCY_SYMBOL = activeCurrency.symbol;
export const CURRENCY_CODE = activeCurrency.code;
export const CURRENCY_NAME = activeCurrency.name;
export const AVAILABLE_CURRENCIES = CURRENCIES;

/**
 * Format number in the active currency
 * @param {number} amount - The amount to format
 * @param {boolean} showDecimals - Whether to show decimal places (default: false)
 * @returns {string} Formatted amount (e.g., "Rs. 25,000" or "$25,000")
 */
export const formatCurrency = (amount, showDecimals = false) => {
  if (amount === null || amount === undefined) return `${CURRENCY_SYMBOL} 0`;
  
  const formatted = showDecimals 
    ? amount.toLocaleString(activeCurrency.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : amount.toLocaleString(activeCurrency.locale, { maximumFractionDigits: 0 });
  
  return `${CURRENCY_SYMBOL} ${formatted}`;
};

/**
 * Format number with currency code
 * @param {number} amount - The amount to format
 * @returns {string} Formatted amount (e.g., "LKR 25,000" or "USD 25,000")
 */
export const formatCurrencyWithCode = (amount) => {
  if (amount === null || amount === undefined) return `${CURRENCY_CODE} 0`;
  
  const formatted = amount.toLocaleString(activeCurrency.locale, { maximumFractionDigits: 0 });
  return `${CURRENCY_CODE} ${formatted}`;
};

/**
 * Get current currency configuration
 * @returns {object} Current currency config
 */
export const getCurrentCurrency = () => activeCurrency;

