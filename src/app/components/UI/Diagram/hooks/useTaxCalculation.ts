import { Portfolio } from '@/types/trading212';
import { useMemo } from 'react';
import { sortByDate } from '../helpers/dataHelpers';

/**
 * Хук для расчета налоговых данных
 */
export function useTaxCalculation(portfolio: Portfolio | undefined) {
  return useMemo(() => {
    if (!portfolio) {
      return {
        totalWithholdingTax: 0,
        dividendDetails: []
      };
    }

    const totalWithholdingTax = portfolio.dividends.reduce((sum, d) => {
      const taxAmount = d.withholdingTaxPLN ?? d.withholdingTax ?? 0;
      return sum + taxAmount;
    }, 0);

    const dividendDetails = sortByDate(portfolio.dividends).map(dividend => ({
      ticker: dividend.ticker,
      name: dividend.name,
      date: dividend.date,
      dividendAmount: dividend.totalPLN ?? dividend.total,
      withholdingTax: dividend.withholdingTaxPLN ?? dividend.withholdingTax ?? 0,
      netAmount: (dividend.totalPLN ?? dividend.total) - (dividend.withholdingTaxPLN ?? dividend.withholdingTax ?? 0)
    }));

    return {
      totalWithholdingTax,
      dividendDetails
    };
  }, [portfolio]);
}
