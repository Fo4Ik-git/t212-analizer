import React from 'react';
import {Portfolio} from '@/types/trading212';
import AppExpanded from '@/app/components/App/AppExpanded/AppExpanded';

interface TestProps {
    portfolio?: Portfolio;
}

export default function Test({portfolio}: TestProps) {
    if (!portfolio) {
        return <div className="p-4">Загрузите CSV-файл для анализа</div>;
    }

    return (
        <>
            <div className="p-4 bg-primary rounded-lg">
                <h1 className="text-xl font-bold mb-4">Отладка данных из dataParser</h1>

                <div className="space-y-6">
                    {/* Депозиты */}
                    <AppExpanded title={`Депозиты (${portfolio.deposits.length})`}>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead>
                                <tr>
                                    <th className="px-2 py-1 text-left">Дата</th>
                                    <th className="px-2 py-1 text-left">Сумма</th>
                                    <th className="px-2 py-1 text-left">Валюта</th>
                                    <th className="px-2 py-1 text-left">Сумма в PLN</th>
                                    <th className="px-2 py-1 text-left">Total</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                {portfolio.deposits.map((deposit, idx) => (
                                    <tr key={idx} className="hover:bg-[#2c3e5f]">
                                        <td className="px-2 py-1">{deposit.date}</td>
                                        <td className="px-2 py-1">{deposit.total ? deposit.total.toFixed(2) : '-'}</td>
                                        <td className="px-2 py-1">{deposit.currency}</td>
                                        <td className="px-2 py-1">
                                            {deposit.totalPLN}
                                        </td>
                                        <td className="px-2 py-1">{deposit.total}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </AppExpanded>

                    {/* Транзакции */}
                    <AppExpanded title={`Транзакции (${portfolio.transactions.length})`}>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead>
                                <tr>
                                    <th className="px-2 py-1 text-left">Дата</th>
                                    <th className="px-2 py-1 text-left">Тикер</th>
                                    <th className="px-2 py-1 text-left">Название</th>
                                    <th className="px-2 py-1 text-left">Тип</th>
                                    <th className="px-2 py-1 text-left">Акции</th>
                                    <th className="px-2 py-1 text-left">Цена</th>
                                    <th className="px-2 py-1 text-left">Сумма</th>
                                    <th className="px-2 py-1 text-left">Валюта</th>
                                    <th className="px-2 py-1 text-left">Сумма в PLN</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                {portfolio.transactions.map((tx, idx) => (
                                    <tr key={idx} className="hover:bg-[#2c3e5f]">
                                        <td className="px-2 py-1">{tx.date}</td>
                                        <td className="px-2 py-1">{tx.ticker}</td>
                                        <td className="px-2 py-1">{tx.name}</td>
                                        <td className="px-2 py-1">{tx.action}</td>
                                        <td className="px-2 py-1">{tx.shares}</td>
                                        <td className="px-2 py-1">{tx.pricePerShare ? tx.pricePerShare.toFixed(2) : '-'}</td>
                                        <td className="px-2 py-1">{tx.total ? tx.total.toFixed(2) : '-'}</td>
                                        <td className="px-2 py-1">{tx.currency}</td>
                                        <td className="px-2 py-1">
                                            {tx.totalPLN}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </AppExpanded>

                    {/* Дивиденды */}
                    <AppExpanded title={`Дивиденды (${portfolio.dividends.length})`}>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead>
                                <tr>
                                    <th className="px-2 py-1 text-left">Дата</th>
                                    <th className="px-2 py-1 text-left">Тикер</th>
                                    <th className="px-2 py-1 text-left">Название</th>
                                    <th className="px-2 py-1 text-left">Сумма</th>
                                    <th className="px-2 py-1 text-left">Налог</th>
                                    <th className="px-2 py-1 text-left">Валюта</th>
                                    <th className="px-2 py-1 text-left">Сумма в PLN</th>
                                    <th className="px-2 py-1 text-left">Налог в PLN</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                {portfolio.dividends.map((div, idx) => (
                                    <tr key={idx} className="hover:bg-[#2c3e5f]">
                                        <td className="px-2 py-1">{div.date}</td>
                                        <td className="px-2 py-1">{div.ticker}</td>
                                        <td className="px-2 py-1">{div.name}</td>
                                        <td className="px-2 py-1">{div.total ? div.total.toFixed(2) : '-'}</td>
                                        <td className="px-2 py-1">{div.withholdingTax ? div.withholdingTax.toFixed(2) : '-'}</td>
                                        <td className="px-2 py-1">{div.currency}</td>
                                        <td className="px-2 py-1">
                                            {div.totalPLN !== null && div.totalPLN !== undefined
                                                ? `${div.totalPLN.toFixed(2)} PLN`
                                                : 'Ошибка конвертации'}
                                        </td>
                                        <td className="px-2 py-1">
                                            {div.withholdingTaxPLN !== null && div.withholdingTaxPLN !== undefined
                                                ? `${div.withholdingTaxPLN.toFixed(2)} PLN`
                                                : 'Ошибка конвертации'}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </AppExpanded>

                    {/* Проценты по неинвестированным средствам */}
                    <AppExpanded title={`Проценты по неинвестированным средствам (${portfolio.interest?.length || 0})`}>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead>
                                <tr>
                                    <th className="px-2 py-1 text-left">Дата</th>
                                    <th className="px-2 py-1 text-left">Действие</th>
                                    <th className="px-2 py-1 text-left">Сумма</th>
                                    <th className="px-2 py-1 text-left">Валюта</th>
                                    <th className="px-2 py-1 text-left">Сумма в PLN</th>
                                    <th className="px-2 py-1 text-left">Примечания</th>
                                    <th className="px-2 py-1 text-left">ID</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                {portfolio.interest && portfolio.interest.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-[#2c3e5f]">
                                        <td className="px-2 py-1">{item.date}</td>
                                        <td className="px-2 py-1">{item.action}</td>
                                        <td className="px-2 py-1">{item.total ? item.total.toFixed(2) : '-'}</td>
                                        <td className="px-2 py-1">{item.currency}</td>
                                        <td className="px-2 py-1">
                                            {item.totalPLN !== null && item.totalPLN !== undefined
                                                ? `${item.totalPLN.toFixed(2)} PLN`
                                                : 'Ошибка конвертации'}
                                        </td>
                                        <td className="px-2 py-1">{item.notes || '-'}</td>
                                        <td className="px-2 py-1">{item.id || '-'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </AppExpanded>
                </div>
            </div>

            {/*<span>{JSON.stringify(portfolio, null, 2)}</span>*/}
        </>
    );
}
