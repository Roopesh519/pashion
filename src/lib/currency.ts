import { siteConfig } from '@/config/site.config';

type CurrencyFormatOptions = Intl.NumberFormatOptions;

const formatterBaseOptions: CurrencyFormatOptions = {
  style: 'currency',
  currency: siteConfig.currency.code,
};

export const currencySymbol =
  new Intl.NumberFormat(siteConfig.currency.locale, formatterBaseOptions)
    .formatToParts(0)
    .find((part) => part.type === 'currency')?.value ?? siteConfig.currency.code;

export function formatCurrency(amount: number, options: CurrencyFormatOptions = {}) {
  return new Intl.NumberFormat(siteConfig.currency.locale, {
    ...formatterBaseOptions,
    ...options,
  }).format(amount);
}
