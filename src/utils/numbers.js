/**
 * Formats a number as a price in Polish format (e.g., 100,00 zł)
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency symbol (default: 'zł')
 * @returns {string} Formatted price string
 */
export function formatPrice(amount, currency = 'zł') {
  const formatted = amount.toLocaleString('pl-PL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return `${formatted} ${currency}`
}

/**
 * Formats a number as a price without currency symbol
 * @param {number} amount - The amount to format
 * @returns {string} Formatted price string without currency
 */
export function formatPriceNoCurrency(amount) {
  return amount.toLocaleString('pl-PL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
