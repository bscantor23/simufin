export class CurrencyFormatter {
  private currency: string;
  private locale: string;
  private minimumFractionDigits: number;
  private maximumFractionDigits: number;

  constructor(
    currency: string = "COP",
    locale: string = "es-CO",
    minimumFractionDigits: number = 0,
    maximumFractionDigits: number = 3
  ) {
    this.currency = currency;
    this.locale = locale;
    this.minimumFractionDigits = minimumFractionDigits;
    this.maximumFractionDigits = maximumFractionDigits;
  }

  format(amount: number, overrideCurrency?: string): string {
    const currency = overrideCurrency || this.currency;
    return new Intl.NumberFormat(this.locale, {
      style: "currency",
      currency,
      minimumFractionDigits: this.minimumFractionDigits,
      maximumFractionDigits: this.maximumFractionDigits,
    }).format(amount);
  }

  // Update the currency for future format calls
  setCurrency(currency: string): void {
    this.currency = currency;
  }

  // Get the current currency
  getCurrency(): string {
    return this.currency;
  }
}
