/**
 * Currency utility functions for consistent formatting and parsing
 */

/**
 * Formats a number to currency display with commas
 * @param {number|string} amount - The amount to format
 * @param {string} currency - The currency symbol (default: SAR)
 * @param {boolean} showSymbol - Whether to show currency symbol (default: true)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'SAR', showSymbol = true) => {
  if (amount === null || amount === undefined || amount === '') {
    return showSymbol ? `0 ${currency}` : '0';
  }
  
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount)) {
    return showSymbol ? `0 ${currency}` : '0';
  }
  
  // Format with commas and 2 decimal places
  const formatted = numericAmount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  
  return showSymbol ? `${formatted} ${currency}` : formatted;
};

/**
 * Formats a number to display as millions if it's in millions
 * @param {number|string} amount - The amount to format
 * @param {boolean} autoConvert - Whether to automatically convert large numbers to millions format
 * @returns {string} Formatted amount
 */
export const formatAmount = (amount, autoConvert = false) => {
  if (amount === null || amount === undefined || amount === '') {
    return '0';
  }
  
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount)) {
    return '0';
  }
  
  // If autoConvert is true and amount is >= 1 million, show as "X.X Million"
  if (autoConvert && numericAmount >= 1000000) {
    const millions = numericAmount / 1000000;
    return `${millions.toFixed(1)} Million`;
  }
  
  // Otherwise format with commas
  return numericAmount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

/**
 * Parses a formatted currency string back to a number
 * @param {string} formattedAmount - The formatted amount string
 * @returns {number} Parsed numeric value
 */
export const parseCurrency = (formattedAmount) => {
  if (!formattedAmount || typeof formattedAmount !== 'string') {
    return 0;
  }
  
  // Remove currency symbols, commas, and extra spaces
  const cleanedAmount = formattedAmount
    .replace(/[^\d.-]/g, '') // Keep only digits, dots, and minus signs
    .trim();
  
  const parsed = parseFloat(cleanedAmount);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Converts a value that might be in millions to full numeric value
 * For example: 8 (representing 8 million) -> 8000000
 * @param {number|string} value - The value to convert
 * @param {boolean} assumeMillions - Whether to assume the value is in millions if it's < 1000
 * @returns {number} Full numeric value
 */
export const convertToFullAmount = (value, assumeMillions = false) => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  
  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) {
    return 0;
  }
  
  // If assumeMillions is true and value is small (< 1000), assume it's in millions
  if (assumeMillions && numericValue > 0 && numericValue < 1000) {
    return numericValue * 1000000;
  }
  
  return numericValue;
};

/**
 * Converts a full amount to millions format for display
 * @param {number|string} amount - The full amount
 * @returns {number} Amount in millions
 */
export const convertToMillions = (amount) => {
  if (amount === null || amount === undefined || amount === '') {
    return 0;
  }
  
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount)) {
    return 0;
  }
  
  return numericAmount / 1000000;
};

/**
 * Validates if an amount is a valid number
 * @param {any} amount - The amount to validate
 * @returns {boolean} True if valid
 */
export const isValidAmount = (amount) => {
  if (amount === null || amount === undefined || amount === '') {
    return false;
  }
  
  const numericAmount = parseFloat(amount);
  return !isNaN(numericAmount) && numericAmount >= 0;
};

/**
 * Formats amount for input fields (without currency symbol)
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted amount for input
 */
export const formatAmountForInput = (amount) => {
  if (amount === null || amount === undefined || amount === '') {
    return '';
  }
  
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount)) {
    return '';
  }
  
  return numericAmount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

/**
 * Parses input value and removes formatting
 * @param {string} inputValue - The input value to parse
 * @returns {number} Clean numeric value
 */
export const parseInputAmount = (inputValue) => {
  if (!inputValue || typeof inputValue !== 'string') {
    return 0;
  }
  
  // Remove commas and other formatting
  const cleaned = inputValue.replace(/,/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};
