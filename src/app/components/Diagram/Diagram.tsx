import {useEffect, useState} from 'react';
import {
    PieChart, Pie, Tooltip,
    ResponsiveContainer, Cell
} from 'recharts';
import {Portfolio} from '@/types/trading212';
import {ActionType} from '@/types/trading212';
import {formatCurrency} from '@/services/currencyService';

interface DiagramProps {
    portfolio?: Portfolio;
}

interface AssetDistributionItem {
    name: string;
    value: number;
    ticker: string;
    currency: string;
}

interface StatsSummary {
    count: number;
    total: number;
    currency: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Diagram({portfolio}: DiagramProps) {
    const [assetDistribution, setAssetDistribution] = useState<AssetDistributionItem[]>([]);
    const [stats, setStats] = useState<{
        deposits: StatsSummary;
        purchases: StatsSummary;
        sales: StatsSummary;
        dividends: StatsSummary;
        interestInCash?: StatsSummary;
    }>({
        deposits: {count: 0, total: 0, currency: 'PLN'},
        purchases: {count: 0, total: 0, currency: 'PLN'},
        sales: {count: 0, total: 0, currency: 'PLN'},
        dividends: {count: 0, total: 0, currency: 'PLN'},
        interestInCash: {count: 0, total: 0, currency: 'PLN'}
    });

    useEffect(() => {
        if (!portfolio) return;

        calculateAssetDistribution(portfolio);
        calculateStats(portfolio);
    }, [portfolio]);

    function calculateAssetDistribution(portfolio: Portfolio) {
        const stocksByTicker: Record<string, {
            name: string;
            shares: number;
            value: number;
            ticker: string;
            currency: string; // Добавляем поле для валюты
        }> = {};

        portfolio.transactions.forEach(transaction => {
            if (transaction.action === ActionType.MARKET_BUY) {
                if (!stocksByTicker[transaction.ticker]) {
                    stocksByTicker[transaction.ticker] = {
                        name: transaction.name,
                        shares: 0,
                        value: 0,
                        ticker: transaction.ticker,
                        currency: 'PLN' // По умолчанию используем PLN
                    };
                }
                stocksByTicker[transaction.ticker].shares += transaction.shares;

                // Используем только totalPLN, не используем fallback на total
                if (transaction.totalPLN !== null && transaction.totalPLN !== undefined) {
                    stocksByTicker[transaction.ticker].value += transaction.totalPLN;
                }
                // Если totalPLN не доступен, пропускаем эту транзакцию
            } else if (transaction.action === ActionType.MARKET_SELL) {
                if (stocksByTicker[transaction.ticker]) {
                    stocksByTicker[transaction.ticker].shares -= transaction.shares;

                    // Вычитаем только сконвертированную сумму
                    if (transaction.totalPLN !== null && transaction.totalPLN !== undefined) {
                        stocksByTicker[transaction.ticker].value -= transaction.totalPLN;
                    }
                }
            }
        });

        const distribution = Object.values(stocksByTicker)
            .filter(stock => stock.shares > 0)
            .map(stock => ({
                name: stock.name,
                value: stock.value,
                ticker: stock.ticker,
                currency: 'PLN' // Явно указываем валюту
            }));

        setAssetDistribution(distribution);
    }

    function calculateStats(portfolio: Portfolio) {
        // Проверяем, все ли депозиты конвертированы в PLN
        const allDepositsConverted = portfolio.deposits.every(deposit => deposit.totalPLN);


        // Депозиты в PLN
        const deposits = {
            count: portfolio.deposits.length,
            total: portfolio.deposits.reduce((sum, deposit) => {
                // Если totalPLN доступен, используем его, иначе конвертируем на месте
                if (deposit.totalPLN) {
                    return sum + deposit.totalPLN;
                }
                // Если нет возможности конвертировать, используем исходную сумму, но помечаем валюту
                return sum + deposit.total;
            }, 0),
            currency: allDepositsConverted ? 'PLN' : 'EUR'
        };

        // Покупки акций в PLN
        const purchases = {
            count: portfolio.transactions.filter(t => t.action === ActionType.MARKET_BUY).length,
            total: portfolio.transactions
                .filter(t => t.action === ActionType.MARKET_BUY)
                .reduce((sum, t) => sum + (t.totalPLN || t.total), 0),
            currency: 'PLN'
        };

        // Продажи акций в PLN
        const sales = {
            count: portfolio.transactions.filter(t => t.action === ActionType.MARKET_SELL).length,
            total: portfolio.transactions
                .filter(t => t.action === ActionType.MARKET_SELL)
                .reduce((sum, t) => sum + (t.totalPLN || t.total), 0),
            currency: 'PLN'
        };

        // Дивиденды в PLN
        const dividends = {
            count: portfolio.dividends.length,
            total: portfolio.dividends.reduce((sum, d) => sum + (d.totalPLN || d.total), 0),
            currency: 'PLN'
        };

        // Проценты в PLN, если есть
        const interestInCash = portfolio.interest ? {
            count: portfolio.interest.length,
            total: portfolio.interest.reduce((sum, i) => sum + (i.totalPLN || i.total), 0),
            currency: 'PLN'
        } : undefined;

        setStats({
            deposits,
            purchases,
            sales,
            dividends,
            interestInCash
        });
    }

    if (!portfolio) {
        return <div className="p-4">Загрузите CSV-файл для анализа</div>;
    }

    return (
        <div className="w-full space-y-8">
            {/* Сводка статистики */}
            <div className="bg-primary p-4 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Сводка</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#243454] p-3 rounded">
                        <h3 className="font-semibold">Депозиты</h3>
                        <p>Количество: {stats.deposits.count}</p>
                        <p>Сумма: {stats.deposits.total.toFixed(2)} {stats.deposits.currency}</p>
                    </div>
                    <div className="bg-[#243454] p-3 rounded">
                        <h3 className="font-semibold">Покупки акций</h3>
                        <p>Количество: {stats.purchases.count}</p>
                        <p>Сумма: {stats.purchases.total.toFixed(2)} PLN</p>
                    </div>
                    <div className="bg-[#243454] p-3 rounded">
                        <h3 className="font-semibold">Продажи акций</h3>
                        <p>Количество: {stats.sales.count}</p>
                        <p>Сумма: {stats.sales.total.toFixed(2)} PLN</p>
                    </div>
                    <div className="bg-[#243454] p-3 rounded">
                        <h3 className="font-semibold">Дивиденды</h3>
                        <p>Количество: {stats.dividends.count}</p>
                        <p>Сумма: {stats.dividends.total.toFixed(2)} PLN</p>
                    </div>
                </div>
            </div>

            {/* Диаграммы и отчеты */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-primary p-4 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Распределение активов</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={assetDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({name, percent}) => `${name} (${(percent as number * 100).toFixed(1)}%)`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {assetDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, name, props) => {
                                    const currency = props?.payload?.currency || 'PLN';
                                    return [`${(value as number).toFixed(2)} ${currency}`, 'Сумма'];
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-primary p-4 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Налоговый отчет</h2>
                    <p>Сумма удержанных налогов: {
                        portfolio.dividends
                            .reduce((sum, d) => sum + (d.withholdingTaxPLN || d.withholdingTax || 0), 0)
                            .toFixed(2)
                    } PLN</p>
                </div>
            </div>
        </div>
    );
}