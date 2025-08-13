// Get the current USD to COP exchange rate from environment variables
const USD_TO_COP_RATE = Number(process.env.EXPO_PUBLIC_DOLLAR_COP_PRICE) || 1;

interface FormattedAmounts {
  usd: string;
  cop: string;
  copValue: number;
}

/**
 * Format a number as USD currency
 */
export const formatUSD = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Format a number as COP currency
 */
export const formatCOP = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Convert USD to COP using the current exchange rate
 */
export const usdToCop = (usdAmount: number): number => {
  return Math.round(usdAmount * USD_TO_COP_RATE);
};

/**
 * Get both USD and COP formatted amounts
 */
export const getFormattedAmounts = (usdAmount: number): FormattedAmounts => {
  const copAmount = usdToCop(usdAmount);
  return {
    usd: formatUSD(usdAmount),
    cop: formatCOP(copAmount),
    copValue: copAmount
  };
};

// For backward compatibility
export const formatCurrency = formatUSD;
