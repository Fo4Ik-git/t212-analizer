import { ActionType, DividendTransaction, StockTransaction } from '@/types/trading212';

/**
 * Фильтрует транзакции по типу действия
 */
export function filterTransactionsByAction(
  transactions: StockTransaction[],
  action: ActionType
): StockTransaction[] {
  return transactions.filter(t => t.action === action);
}

/**
 * Группирует транзакции по тикеру
 */
export function groupTransactionsByTicker(
  transactions: StockTransaction[]
): Record<string, StockTransaction[]> {
  return transactions.reduce((acc, transaction) => {
    const ticker = transaction.ticker;
    if (!acc[ticker]) {
      acc[ticker] = [];
    }
    acc[ticker].push(transaction);
    return acc;
  }, {} as Record<string, StockTransaction[]>);
}

/**
 * Группирует дивиденды по тикеру
 */
export function groupDividendsByTicker(
  dividends: DividendTransaction[]
): Record<string, DividendTransaction[]> {
  return dividends.reduce((acc, dividend) => {
    const ticker = dividend.ticker;
    if (!acc[ticker]) {
      acc[ticker] = [];
    }
    acc[ticker].push(dividend);
    return acc;
  }, {} as Record<string, DividendTransaction[]>);
}

/**
 * Вычисляет общую сумму для массива элементов
 */
export function calculateTotalAmount<T extends { totalPLN?: number; total: number }>(
  items: T[]
): number {
  return items.reduce((sum, item) => sum + (item.totalPLN ?? item.total), 0);
}

/**
 * Сортирует массив по дате
 */
export function sortByDate<T extends { date: string }>(
  items: T[],
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}
