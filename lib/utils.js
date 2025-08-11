// Utility functions for formatting

/**
 * Formats a price number with commas as thousand separators and decimal point
 * @param {number|string} price - The price to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted price string
 */
export const formatPrice = (price, decimals = 2) => {
  // Convert to number if it's a string
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Return '0.00' if price is invalid
  if (isNaN(numPrice)) {
    return '0.00';
  }
  
  // Format with commas and decimal places
  return numPrice.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Formats a price with currency symbol
 * @param {number|string} price - The price to format
 * @param {string} currency - Currency symbol (default: '$')
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted price string with currency
 */
export const formatCurrency = (price, currency = '$', decimals = 2) => {
  return `${currency}${formatPrice(price, decimals)}`;
};