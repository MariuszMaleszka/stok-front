

/**
 * Formats a number as a price without currency symbol
 * @param {number} amount - The amount to format
 * @returns {string} Formatted price string without currency
 */
export function formatPrice(amount) {
  return amount.toLocaleString('pl-PL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/**
 * Generates a unique 8-character ID using timestamp and random characters
 * @returns {string} 8-character unique identifier
 */
export function generateUniqueId() {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2)
  const combined = timestamp + random
  return combined.substring(0, 8).toUpperCase()
}
