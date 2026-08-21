import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export const CURRENCIES = {
  INR: { code: 'INR', symbol: '₹', name: 'INR (₹) - Indian Rupee', locale: 'en-IN' },
  USD: { code: 'USD', symbol: '$', name: 'USD ($) - US Dollar', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'EUR (€) - Euro', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'GBP (£) - British Pound', locale: 'en-GB' },
  AED: { code: 'AED', symbol: 'AED', name: 'AED (AED) - UAE Dirham', locale: 'en-AE' },
};

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('app_currency') || 'INR';
  });

  const setCurrency = (code) => {
    if (CURRENCIES[code]) {
      setCurrencyState(code);
      localStorage.setItem('app_currency', code);
    }
  };

  const currencyConfig = CURRENCIES[currency] || CURRENCIES.INR;
  const currencySymbol = currencyConfig.symbol;

  const formatCurrency = useCallback((amount) => {
    const numeric = Number(amount) || 0;
    try {
      return new Intl.NumberFormat(currencyConfig.locale, {
        style: 'currency',
        currency: currencyConfig.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numeric);
    } catch (e) {
      return `${currencySymbol}${numeric.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }, [currencyConfig, currencySymbol]);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencySymbol,
        currencyConfig,
        setCurrency,
        formatCurrency,
        currencies: CURRENCIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Fallback safe defaults if used outside provider
    return {
      currency: 'INR',
      currencySymbol: '₹',
      currencyConfig: CURRENCIES.INR,
      setCurrency: () => {},
      formatCurrency: (val) => `₹${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      currencies: CURRENCIES,
    };
  }
  return context;
};
