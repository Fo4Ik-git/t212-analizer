export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const DEFAULT_CURRENCY = 'PLN';

export const DIALOG_TITLES = {
  deposits: 'Детали депозитов',
  purchases: 'Детали покупок акций',
  sales: 'Детали продаж акций',
  dividends: 'Детали дивидендов'
} as const;

export const STATS_LABELS = {
  deposits: 'Депозиты',
  purchases: 'Покупки акций',
  sales: 'Продажи акций',
  dividends: 'Дивиденды'
} as const;

export const CHART_CONFIG = {
  pieChart: {
    outerRadius: 80,
    height: 300
  },
  colors: COLORS
} as const;

export const NUMBER_FORMAT = {
  decimalPlaces: 2,
  locale: 'ru-RU'
} as const;
