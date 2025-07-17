import { DEFAULT_CURRENCY } from './constants';

/**
 * Форматирует сумму в валюте
 */
export function formatCurrency(amount: number, currency: string = DEFAULT_CURRENCY): string {
  return `${amount.toFixed(2)} ${currency}`;
}

/**
 * Получает конвертированную сумму или использует исходную
 */
export function getConvertedAmount(item: { totalPLN?: number; total: number }): number {
  return item.totalPLN ?? item.total;
}

/**
 * Проверяет, все ли элементы имеют конвертированную сумму
 */
export function areAllConverted(items: { totalPLN?: number }[]): boolean {
  return items.every(item => item.totalPLN !== undefined && item.totalPLN !== null);
}

/**
 * Получает валюту на основе конвертации
 */
export function getCurrency(items: { totalPLN?: number }[]): string {
  return areAllConverted(items) ? DEFAULT_CURRENCY : 'EUR';
}

// Реэкспорт константы для удобства
export { DEFAULT_CURRENCY };
