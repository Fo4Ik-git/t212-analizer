import { Portfolio } from '@/types/trading212';
import { useMemo } from 'react';
import { calculateTotalAmount } from '../helpers/dataHelpers';
import { formatCurrency } from '../utils';
import { Tooltip } from './Tooltip';

interface PortfolioSummaryProps {
  portfolio: Portfolio;
}

export function PortfolioSummary({ portfolio }: PortfolioSummaryProps) {
  const summary = useMemo(() => {
    const totalDeposits = calculateTotalAmount(portfolio.deposits);
    const totalPurchases = calculateTotalAmount(portfolio.transactions.filter(t => t.action === 'Market buy'));
    const totalSales = calculateTotalAmount(portfolio.transactions.filter(t => t.action === 'Market sell'));
    const totalDividends = calculateTotalAmount(portfolio.dividends);
    const totalInterest = portfolio.interest ? calculateTotalAmount(portfolio.interest) : 0;

    const netInvestment = totalDeposits - totalPurchases + totalSales;
    const totalReturns = totalDividends + totalInterest;
    const totalBalance = totalDeposits + totalReturns - totalPurchases + totalSales;

    return {
      totalDeposits,
      totalPurchases,
      totalSales,
      totalDividends,
      totalInterest,
      netInvestment,
      totalReturns,
      totalBalance
    };
  }, [portfolio]);

  return (
    <div className="bg-primary p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Общая сводка портфеля</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Tooltip content="Общая сумма всех депозитов на счет">
              <span className="cursor-help">Общие депозиты:</span>
            </Tooltip>
            <span className="font-semibold text-green-600">{formatCurrency(summary.totalDeposits)}</span>
          </div>
          <div className="flex justify-between">
            <Tooltip content="Общая сумма всех покупок акций">
              <span className="cursor-help">Общие покупки:</span>
            </Tooltip>
            <span className="font-semibold text-red-600">{formatCurrency(summary.totalPurchases)}</span>
          </div>
          <div className="flex justify-between">
            <Tooltip content="Общая сумма всех продаж акций">
              <span className="cursor-help">Общие продажи:</span>
            </Tooltip>
            <span className="font-semibold text-green-600">{formatCurrency(summary.totalSales)}</span>
          </div>
          <div className="flex justify-between">
            <Tooltip content="Общая сумма всех полученных дивидендов">
              <span className="cursor-help">Дивиденды:</span>
            </Tooltip>
            <span className="font-semibold text-green-600">{formatCurrency(summary.totalDividends)}</span>
          </div>
          {summary.totalInterest > 0 && (
            <div className="flex justify-between">
              <Tooltip content="Проценты на денежные средства от Trading212 (Interest on cash) - пассивный доход на неинвестированные средства">
                <span className="cursor-help">
                  Проценты:
                  <span className="ml-1 text-xs text-blue-500">💰</span>
                </span>
              </Tooltip>
              <span className="font-semibold text-green-600">{formatCurrency(summary.totalInterest)}</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Tooltip content="Чистые инвестиции = депозиты - покупки + продажи (сколько денег осталось свободными)">
              <span className="cursor-help">Чистые инвестиции:</span>
            </Tooltip>
            <span className={`font-semibold ${summary.netInvestment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.netInvestment)}
            </span>
          </div>
          <div className="flex justify-between">
            <Tooltip content="Общий пассивный доход: дивиденды от акций + проценты на денежные средства">
              <span className="cursor-help">Общий доход:</span>
            </Tooltip>
            <span className="font-semibold text-green-600">{formatCurrency(summary.totalReturns)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <Tooltip content="Общий баланс портфеля = депозиты + доходы - покупки + продажи">
              <span className="font-bold cursor-help">Общий баланс:</span>
            </Tooltip>
            <span className={`font-bold ${summary.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.totalBalance)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
