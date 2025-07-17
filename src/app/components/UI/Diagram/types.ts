export interface AssetDistributionItem {
  name: string;
  value: number;
  ticker: string;
  currency: string;
}

export interface StatsSummary {
  count: number;
  total: number;
  currency: string;
}

export interface PortfolioStats {
  deposits: StatsSummary;
  purchases: StatsSummary;
  sales: StatsSummary;
  dividends: StatsSummary;
  interestInCash?: StatsSummary;
}

export type DialogType = 'deposits' | 'purchases' | 'sales' | 'dividends';

export interface DialogData {
  isOpen: boolean;
  type: DialogType | null;
  title: string;
}

export interface DividendDetail {
  ticker: string;
  name: string;
  date: string;
  dividendAmount: number;
  withholdingTax: number;
  netAmount: number;
}

export interface TaxCalculationResult {
  totalWithholdingTax: number;
  dividendDetails: DividendDetail[];
}

export interface PortfolioSummaryData {
  totalDeposits: number;
  totalPurchases: number;
  totalSales: number;
  totalDividends: number;
  totalInterest: number;
  netInvestment: number;
  totalReturns: number;
  totalBalance: number;
}
