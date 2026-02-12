import { CURRENCIES, type CurrencyCode } from "../constants/countries";

export function formatPrice(amount: number, currency: CurrencyCode = "COP"): string {
  const config = CURRENCIES[currency];
  const formatted = new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(amount);

  return `${config.symbol} ${formatted}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}
