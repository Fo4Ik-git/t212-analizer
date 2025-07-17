import { ActionType, Portfolio } from '@/types/trading212';
import { useMemo } from 'react';
import { calculateTotalAmount, filterTransactionsByAction } from '../helpers/dataHelpers';
import { PortfolioStats } from '../types';
import { DEFAULT_CURRENCY, getCurrency } from '../utils';

/**
 * Хук для вычисления статистики портфеля
 */
export function usePortfolioStats(portfolio: Portfolio | undefined): PortfolioStats {
  return useMemo(() => {
    if (!portfolio) {
      return {
        deposits: { count: 0, total: 0, currency: DEFAULT_CURRENCY },
        purchases: { count: 0, total: 0, currency: DEFAULT_CURRENCY },
        sales: { count: 0, total: 0, currency: DEFAULT_CURRENCY },
        dividends: { count: 0, total: 0, currency: DEFAULT_CURRENCY },
        interestInCash: { count: 0, total: 0, currency: DEFAULT_CURRENCY }
      };
    }

    // Депозиты
    const deposits = {
      count: portfolio.deposits.length,
      total: calculateTotalAmount(portfolio.deposits),
      currency: getCurrency(portfolio.deposits)
    };

    // Покупки акций
    const purchaseTransactions = filterTransactionsByAction(portfolio.transactions, ActionType.MARKET_BUY);
    const purchases = {
      count: purchaseTransactions.length,
      total: calculateTotalAmount(purchaseTransactions),
      currency: DEFAULT_CURRENCY
    };

    // Продажи акций
    const saleTransactions = filterTransactionsByAction(portfolio.transactions, ActionType.MARKET_SELL);
    const sales = {
      count: saleTransactions.length,
      total: calculateTotalAmount(saleTransactions),
      currency: DEFAULT_CURRENCY
    };

    // Дивиденды
    const dividends = {
      count: portfolio.dividends.length,
      total: calculateTotalAmount(portfolio.dividends),
      currency: DEFAULT_CURRENCY
    };

    // Проценты (опционально)
    const interestInCash = portfolio.interest ? {
      count: portfolio.interest.length,
      total: calculateTotalAmount(portfolio.interest),
      currency: DEFAULT_CURRENCY
    } : undefined;

    return {
      deposits,
      purchases,
      sales,
      dividends,
      interestInCash
    };
  }, [portfolio]);
}
