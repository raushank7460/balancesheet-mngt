const CURRENCY_LOCALES = {
  INR: { locale: 'en-IN', symbol: '₹' },
  USD: { locale: 'en-US', symbol: '$' },
  EUR: { locale: 'de-DE', symbol: '€' },
  GBP: { locale: 'en-GB', symbol: '£' },
  AED: { locale: 'en-AE', symbol: 'AED' },
};

/**
 * Format currency values dynamically (INR ₹1,23,456.00 or USD $1,234.56)
 */
export const formatCurrency = (amount, currencyCode) => {
  const code = currencyCode || localStorage.getItem('app_currency') || 'INR';
  const numeric = Number(amount) || 0;
  const config = CURRENCY_LOCALES[code] || { locale: 'en-IN', symbol: '₹' };

  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numeric);
  } catch (e) {
    return `${config.symbol} ${numeric.toLocaleString(config.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

export const getActiveCurrencySymbol = (currencyCode) => {
  const code = currencyCode || localStorage.getItem('app_currency') || 'INR';
  return CURRENCY_LOCALES[code]?.symbol || '₹';
};

/**
 * Format dates into standard human-readable representation
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format Date to ISO string YYYY-MM-DD for input[type="date"]
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};
