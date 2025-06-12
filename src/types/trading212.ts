/**
 * Типы действий в Trading212
 */
export enum ActionType {
  // Покупка/продажа
  MARKET_BUY = 'Market buy',
  MARKET_SELL = 'Market sell',

  // Дивиденды
  DIVIDEND = 'Dividend (Dividend)',
  DIVIDEND_TAX_EXEMPTED = 'Dividend (Tax exempted)',
  DIVIDEND_MANUFACTURED = 'Dividend (Dividend manufactured payment)',

  // Депозиты/выводы
  DEPOSIT = 'Deposit',
  WITHDRAWAL = 'Withdrawal',

  // Проценты
  INTEREST = 'Interest on cash',

  // Конвертация валюты
  CURRENCY_CONVERSION = 'Currency conversion'
}

// Группы действий для упрощения проверок
export const DIVIDEND_ACTIONS = [
  ActionType.DIVIDEND,
  ActionType.DIVIDEND_TAX_EXEMPTED,
  ActionType.DIVIDEND_MANUFACTURED
];

export const MARKET_ACTIONS = [
  ActionType.MARKET_BUY,
  ActionType.MARKET_SELL
];

export const CASH_ACTIONS = [
  ActionType.DEPOSIT,
  ActionType.WITHDRAWAL,
  ActionType.INTEREST
];

export interface BaseTransaction {
  action: string;
  date: string;
  currency: string;
  total: number;
}

export interface StockTransaction extends BaseTransaction {
  ticker: string;
  name: string;
  shares: number;
  pricePerShare: number;
  shareCurrency: string;
  exchangeRate?: number;
  fee?: number;
  totalPLN: number;
  feePLN: number;
}

export interface DividendTransaction extends BaseTransaction {
  ticker: string;
  name: string;
  shares: number;
  pricePerShare: number;
  shareCurrency: string;
  withholdingTax: number;
  withholdingTaxCurrency: string;
  totalPLN: number;
  withholdingTaxPLN: number;
}

export interface CashTransaction extends BaseTransaction {
  notes: string;
  id: string;
  totalPLN: number;
}

export interface CurrencyConversion extends BaseTransaction {
  fromAmount: number;
  fromCurrency: string;
  toAmount: number;
  toCurrency: string;
  fee: number;
  feeCurrency: string;
  fromAmountPLN: number;
  toAmountPLN: number;
  feePLN: number;
  totalPLN: number;
}

export interface Portfolio {
  transactions: StockTransaction[];
  dividends: DividendTransaction[];
  deposits: CashTransaction[];
  withdrawals: CashTransaction[];
  interest: CashTransaction[];
  conversions: CurrencyConversion[];
}
