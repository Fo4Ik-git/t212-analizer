import {
    Portfolio, StockTransaction, DividendTransaction,
    CashTransaction, CurrencyConversion,
    ActionType, DIVIDEND_ACTIONS, MARKET_ACTIONS, CASH_ACTIONS
} from '@/types/trading212';
import {convertCurrency} from '@/services/currencyService';

interface CSVColumnMap {
    [key: string]: number;
}

function createColumnMap(headers: string[]): CSVColumnMap {
    const map: CSVColumnMap = {};
    headers.forEach((header, index) => {
        map[header] = index;
    });
    return map;
}

function getValueFromRow(row: string[], columnMap: CSVColumnMap, columnName: string): string {
    const index = columnMap[columnName];
    if (index === undefined || index >= row.length) return '';
    return row[index] || '';
}

function getNumberFromRow(row: string[], columnMap: CSVColumnMap, columnName: string): number {
    const value = getValueFromRow(row, columnMap, columnName);
    if (!value || value === 'Not available') return 0;
    return parseFloat(value) || 0;
}

export async function parseCSVData(csvData: string[][], options?: {
    skipRatesFetch?: boolean,
    handleFutureRates?: boolean
}): Promise<Portfolio> {
    if (csvData.length < 1) return {
        transactions: [],
        dividends: [],
        deposits: [],
        withdrawals: [],
        interest: [],
        conversions: []
    };

    // Получаем заголовки из первой строки
    const headers = csvData[0];
    const columnMap = createColumnMap(headers);

    // Создаем массивы промисов для каждого типа транзакций
    const transactionPromises: Promise<StockTransaction>[] = [];
    const dividendPromises: Promise<DividendTransaction>[] = [];
    const depositPromises: Promise<CashTransaction>[] = [];
    const withdrawalPromises: Promise<CashTransaction>[] = [];
    const interestPromises: Promise<CashTransaction>[] = [];
    const conversionPromises: Promise<CurrencyConversion>[] = [];

    // Проверяем на будущие даты
    const currentDate = new Date();

    // Пропускаем заголовок
    const rows = csvData.slice(1);

    // Фильтруем ошибочные строки
    const validRows = rows.filter(row => row.length >= 3);

    // Настраиваем обработку
    const portfolio: Portfolio = {
        transactions: [],
        dividends: [],
        deposits: [],
        withdrawals: [],
        interest: [],
        conversions: []
    };

    for (const row of validRows) {
        try {
            const action = getValueFromRow(row, columnMap, 'Action') || '';

            if (action === ActionType.MARKET_BUY || action === ActionType.MARKET_SELL) {
                transactionPromises.push(parseStockTransactionWithPLN(row, columnMap, options?.skipRatesFetch));
            } else if (DIVIDEND_ACTIONS.includes(action as ActionType)) {
                dividendPromises.push(parseDividendTransactionWithPLN(row, columnMap));
            } else if (action === ActionType.DEPOSIT) {
                depositPromises.push(parseCashTransactionWithPLN(row, columnMap));
            } else if (action === ActionType.WITHDRAWAL) {
                withdrawalPromises.push(parseCashTransactionWithPLN(row, columnMap));
            } else if (action === ActionType.INTEREST) {
                interestPromises.push(parseCashTransactionWithPLN(row, columnMap));
            } else if (action === ActionType.CURRENCY_CONVERSION) {
                conversionPromises.push(parseCurrencyConversionWithPLN(row, columnMap));
            }
        } catch (error) {
            console.warn('Ошибка при обработке строки:', error);
        }
    }

    // Ожидаем выполнения всех промисов
    portfolio.transactions = (await Promise.all(transactionPromises)).filter(Boolean);
    portfolio.dividends = (await Promise.all(dividendPromises)).filter(Boolean);
    portfolio.deposits = (await Promise.all(depositPromises)).filter(Boolean);
    portfolio.withdrawals = (await Promise.all(withdrawalPromises)).filter(Boolean);
    portfolio.interest = (await Promise.all(interestPromises)).filter(Boolean);
    portfolio.conversions = (await Promise.all(conversionPromises)).filter(Boolean);

    return portfolio;
}

async function parseStockTransactionWithPLN(row: string[], columnMap: CSVColumnMap, skipRatesFetch?: boolean): Promise<StockTransaction> {
    const transaction = parseStockTransaction(row, columnMap);
    const date = transaction.date.split(' ')[0];

    // Конвертируем total в PLN
    const totalPLN = await convertCurrency(
        transaction.total,
        transaction.currency,
        'PLN',
        date,
        skipRatesFetch
    );

    // Конвертируем fee в PLN если он есть
    const feePLN = transaction.fee
        ? await convertCurrency(transaction.fee, transaction.currency, 'PLN', date, skipRatesFetch)
        : null;

    return {
        ...transaction,
        totalPLN: totalPLN || transaction.total,
        feePLN: feePLN || 0
    };
}

async function parseDividendTransactionWithPLN(row: string[], columnMap: CSVColumnMap): Promise<DividendTransaction> {
    const dividend = parseDividendTransaction(row, columnMap);
    const date = dividend.date.split(' ')[0];

    // Проверяем, что у нас правильная валюта
    const currency = dividend.currency;

    // Проверка валюты на корректность
    if (!currency || typeof currency !== 'string' || currency.trim() === '') {
        console.warn(`Некорректная валюта для дивиденда на дату ${date}. Используем значение без конвертации.`);
        return {
            ...dividend,
            totalPLN: dividend.total,
            withholdingTaxPLN: dividend.withholdingTax || 0
        };
    }

    // Если валюта уже PLN, не конвертируем
    if (currency === 'PLN') {
        return {
            ...dividend,
            totalPLN: dividend.total,
            withholdingTaxPLN: dividend.withholdingTax || 0
        };
    }

    // Конвертируем total в PLN
    const totalPLN = await convertCurrency(
        dividend.total,
        currency,
        'PLN',
        date
    );

    // Определяем валюту налога с учетом возможных отсутствующих данных
    const taxCurrency = dividend.withholdingTaxCurrency || currency;

    // Конвертируем withholdingTax в PLN
    const withholdingTaxPLN = dividend.withholdingTax
        ? await convertCurrency(
            dividend.withholdingTax,
            taxCurrency,
            'PLN',
            date
        )
        : null;

    return {
        ...dividend,
        totalPLN: totalPLN || dividend.total,
        withholdingTaxPLN: withholdingTaxPLN || 0
    };
}

async function parseCashTransactionWithPLN(row: string[], columnMap: CSVColumnMap): Promise<CashTransaction> {
    const cashTransaction = parseCashTransaction(row, columnMap);
    const date = cashTransaction.date.split(' ')[0];

    // Очищаем валюту от кавычек
    cashTransaction.currency = cashTransaction.currency.replace(/"/g, '');

    // Проверка валюты на корректность
    if (!cashTransaction.currency || typeof cashTransaction.currency !== 'string' || cashTransaction.currency.trim() === '') {
        console.warn(`Некорректная валюта для кассовой операции на дату ${date}. Используем значение без конвертации.`);
        return {
            ...cashTransaction,
            totalPLN: cashTransaction.total,
            currency: cashTransaction.currency || 'UNKNOWN'
        };
    }

    // Если валюта уже PLN, не конвертируем
    if (cashTransaction.currency === 'PLN') {
        return {
            ...cashTransaction,
            totalPLN: cashTransaction.total
        };
    }

    // Конвертируем total в PLN
    const totalPLN = await convertCurrency(
        cashTransaction.total,
        cashTransaction.currency,
        'PLN',
        date
    );

    return {
        ...cashTransaction,
        totalPLN: totalPLN || cashTransaction.total
    };
}

async function parseCurrencyConversionWithPLN(row: string[], columnMap: CSVColumnMap): Promise<CurrencyConversion> {
    const conversion = parseCurrencyConversion(row, columnMap);
    const date = conversion.date.split(' ')[0];

    // Конвертируем fromAmount в PLN
    const fromAmountPLN = await convertCurrency(
        conversion.fromAmount,
        conversion.fromCurrency,
        'PLN',
        date
    );

    // Если toCurrency уже PLN, не конвертируем toAmount
    const toAmountPLN = conversion.toCurrency === 'PLN'
        ? conversion.toAmount
        : await convertCurrency(conversion.toAmount, conversion.toCurrency, 'PLN', date);

    // Конвертируем fee в PLN
    const feePLN = conversion.fee
        ? await convertCurrency(conversion.fee, conversion.feeCurrency, 'PLN', date)
        : null;

    return {
        ...conversion,
        fromAmountPLN: fromAmountPLN || conversion.fromAmount,
        toAmountPLN: toAmountPLN || conversion.toAmount,
        feePLN: feePLN || 0,
        totalPLN: toAmountPLN || conversion.toAmount
    };
}

function parseStockTransaction(row: string[], columnMap: CSVColumnMap): StockTransaction {
    return {
        action: getValueFromRow(row, columnMap, 'Action'),
        date: getValueFromRow(row, columnMap, 'Time'),
        ticker: getValueFromRow(row, columnMap, 'Ticker'),
        name: getValueFromRow(row, columnMap, 'Name'),
        shares: getNumberFromRow(row, columnMap, 'No. of shares'),
        pricePerShare: getNumberFromRow(row, columnMap, 'Price / share'),
        shareCurrency: getValueFromRow(row, columnMap, 'Currency (Price / share)'),
        exchangeRate: getValueFromRow(row, columnMap, 'Exchange rate') !== 'Not available'
            ? getNumberFromRow(row, columnMap, 'Exchange rate')
            : undefined,
        fee: getNumberFromRow(row, columnMap, 'Currency conversion fee'),
        total: getNumberFromRow(row, columnMap, 'Total'),
        currency: getValueFromRow(row, columnMap, 'Currency (Total)'),
        totalPLN: 0, // Изначально 0, будет заполнено позже
        feePLN: 0 // Изначально 0, будет заполнено позже
    };
}

function parseDividendTransaction(row: string[], columnMap: CSVColumnMap): DividendTransaction {
    return {
        action: getValueFromRow(row, columnMap, 'Action'),
        date: getValueFromRow(row, columnMap, 'Time'),
        ticker: getValueFromRow(row, columnMap, 'Ticker'),
        name: getValueFromRow(row, columnMap, 'Name'),
        shares: getNumberFromRow(row, columnMap, 'No. of shares'),
        pricePerShare: getNumberFromRow(row, columnMap, 'Price / share'),
        shareCurrency: getValueFromRow(row, columnMap, 'Currency (Price / share)'),
        total: getNumberFromRow(row, columnMap, 'Total'),
        currency: getValueFromRow(row, columnMap, 'Currency (Total)'),
        withholdingTax: getNumberFromRow(row, columnMap, 'Withholding tax'),
        withholdingTaxCurrency: getValueFromRow(row, columnMap, 'Currency (Withholding tax)'),
        totalPLN: 0, // Изначально 0, будет заполнено позже
        withholdingTaxPLN: 0 // Изначально 0, будет заполнено позже
    };
}

function parseCashTransaction(row: string[], columnMap: CSVColumnMap): CashTransaction {
    return {
        action: getValueFromRow(row, columnMap, 'Action'),
        date: getValueFromRow(row, columnMap, 'Time'),
        notes: getValueFromRow(row, columnMap, 'Notes'),
        id: getValueFromRow(row, columnMap, 'ID'),
        total: getNumberFromRow(row, columnMap, 'Total'),
        currency: getValueFromRow(row, columnMap, 'Currency (Total)'),
        totalPLN: 0 // Изначально 0, будет заполнено позже
    };
}

function parseCurrencyConversion(row: string[], columnMap: CSVColumnMap): CurrencyConversion {
    return {
        action: getValueFromRow(row, columnMap, 'Action'),
        date: getValueFromRow(row, columnMap, 'Time'),
        fromAmount: getNumberFromRow(row, columnMap, 'From amount'),
        fromCurrency: getValueFromRow(row, columnMap, 'From currency'),
        toAmount: getNumberFromRow(row, columnMap, 'To amount'),
        toCurrency: getValueFromRow(row, columnMap, 'To currency'),
        fee: getNumberFromRow(row, columnMap, 'Currency conversion fee'),
        feeCurrency: getValueFromRow(row, columnMap, 'Currency (Currency conversion fee)'),
        currency: getValueFromRow(row, columnMap, 'To currency'),
        total: getNumberFromRow(row, columnMap, 'To amount'),
        totalPLN: 0, // Изначально 0, будет заполнено позже
        toAmountPLN: 0, // Изначально 0, будет заполнено позже
        fromAmountPLN: 0, // Изначально 0, будет заполнено позже
        feePLN: 0, // Изначально 0, будет заполнено позже
    };
}
