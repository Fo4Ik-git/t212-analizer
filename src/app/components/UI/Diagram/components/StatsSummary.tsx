import { STATS_LABELS } from '../constants';
import { PortfolioStats } from '../types';
import { formatCurrency } from '../utils';

interface StatsSummaryProps {
  stats: PortfolioStats;
}

export function StatsSummary({ stats }: StatsSummaryProps) {
  return (
    <div className="bg-primary p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Сводка</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-secondary p-3 rounded">
          <h3 className="font-semibold">{STATS_LABELS.deposits}</h3>
          <p>Количество: {stats.deposits.count}</p>
          <p>Сумма: {formatCurrency(stats.deposits.total, stats.deposits.currency)}</p>
        </div>
        <div className="bg-secondary p-3 rounded">
          <h3 className="font-semibold">{STATS_LABELS.purchases}</h3>
          <p>Количество: {stats.purchases.count}</p>
          <p>Сумма: {formatCurrency(stats.purchases.total, stats.purchases.currency)}</p>
        </div>
        <div className="bg-secondary p-3 rounded">
          <h3 className="font-semibold">{STATS_LABELS.sales}</h3>
          <p>Количество: {stats.sales.count}</p>
          <p>Сумма: {formatCurrency(stats.sales.total, stats.sales.currency)}</p>
        </div>
        <div className="bg-secondary p-3 rounded">
          <h3 className="font-semibold">{STATS_LABELS.dividends}</h3>
          <p>Количество: {stats.dividends.count}</p>
          <p>Сумма: {formatCurrency(stats.dividends.total, stats.dividends.currency)}</p>
        </div>
      </div>
    </div>
  );
}
