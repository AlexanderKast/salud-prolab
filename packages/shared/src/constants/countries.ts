export const COUNTRIES = {
  CO: { code: "CO", name: "Colombia", currency: "COP" as const, taxRate: 0.19 },
  EC: { code: "EC", name: "Ecuador", currency: "USD" as const, taxRate: 0.12 },
} as const;

export const CURRENCIES = {
  COP: { code: "COP", symbol: "$", name: "Peso Colombiano", decimals: 0 },
  USD: { code: "USD", symbol: "US$", name: "Dólar Estadounidense", decimals: 2 },
} as const;

export type CountryCode = keyof typeof COUNTRIES;
export type CurrencyCode = keyof typeof CURRENCIES;
