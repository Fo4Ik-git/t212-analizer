import { Portfolio } from '@/types/trading212';
import { useTaxCalculation } from '../hooks/useTaxCalculation';
import { formatCurrency } from '../utils';

interface TaxReportProps {
  portfolio: Portfolio;
}

export function TaxReport({ portfolio }: TaxReportProps) {
  const { totalWithholdingTax, dividendDetails } = useTaxCalculation(portfolio);

  return (
    <div className="bg-primary p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Налоговый отчет</h2>
      <div className="space-y-2">
        <p>Сумма удержанных налогов: {formatCurrency(totalWithholdingTax)}</p>
        <p>Количество дивидендных выплат: {dividendDetails.length}</p>
        {dividendDetails.length > 0 && (
          <p>Среднее удержание налога: {formatCurrency(totalWithholdingTax / dividendDetails.length)}</p>
        )}
      </div>
    </div>
  );
}
