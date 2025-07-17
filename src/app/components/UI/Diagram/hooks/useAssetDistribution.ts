import { ActionType, Portfolio } from '@/types/trading212';
import { useMemo } from 'react';
import { filterTransactionsByAction } from '../helpers/dataHelpers';
import { AssetDistributionItem } from '../types';
import { DEFAULT_CURRENCY } from '../utils';

/**
 * Хук для вычисления распределения активов
 */
export function useAssetDistribution(portfolio: Portfolio | undefined): AssetDistributionItem[] {
  return useMemo(() => {
    if (!portfolio) return [];

    const stocksByTicker: Record<string, {
      name: string;
      shares: number;
      value: number;
      ticker: string;
      currency: string;
    }> = {};

    // Обработка покупок
    const purchases = filterTransactionsByAction(portfolio.transactions, ActionType.MARKET_BUY);
    purchases.forEach(transaction => {
      if (!stocksByTicker[transaction.ticker]) {
        stocksByTicker[transaction.ticker] = {
          name: transaction.name,
          shares: 0,
          value: 0,
          ticker: transaction.ticker,
          currency: DEFAULT_CURRENCY
        };
      }
      stocksByTicker[transaction.ticker].shares += transaction.shares;
      stocksByTicker[transaction.ticker].value += transaction.totalPLN ?? transaction.total;
    });

    // Обработка продаж
    const sales = filterTransactionsByAction(portfolio.transactions, ActionType.MARKET_SELL);
    sales.forEach(transaction => {
      if (stocksByTicker[transaction.ticker]) {
        stocksByTicker[transaction.ticker].shares -= transaction.shares;
        stocksByTicker[transaction.ticker].value -= transaction.totalPLN ?? transaction.total;
      }
    });

    return Object.values(stocksByTicker)
      .filter(stock => stock.shares > 0)
      .map(stock => ({
        name: stock.name,
        value: stock.value,
        ticker: stock.ticker,
        currency: DEFAULT_CURRENCY
      }));
  }, [portfolio]);
}
