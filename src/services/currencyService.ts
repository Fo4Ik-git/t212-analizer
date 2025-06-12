// Кэш для хранения курсов валют
interface ExchangeRatesCache {
    [date: string]: {
        [currency: string]: number;
    };
}

// Отслеживание загруженных периодов
interface LoadedPeriods {
    [periodKey: string]: boolean;
}

const exchangeRatesCache: ExchangeRatesCache = {};
const loadedPeriods: LoadedPeriods = {};

/**
 * Создает ключ периода для отслеживания загруженных данных
 */
function getPeriodKey(startDate: string, endDate: string): string {
    return `${startDate}_${endDate}`;
}

/**
 * Форматирует дату в строку YYYY-MM-DD
 */
function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

/**
 * Вычисляет начало и конец квартала для указанной даты
 */
function getQuarterDates(date: Date): { startDate: string, endDate: string } {
    const currentDate = new Date(date);

    // Определяем начало периода (до 92 дней назад от текущей даты)
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - 91);

    return {
        startDate: formatDate(startDate),
        endDate: formatDate(currentDate)
    };
}

/**
 * Загружает таблицу курсов валют за указанный период
 */
async function loadExchangeRatesTable(startDate: string, endDate: string): Promise<boolean> {
    const periodKey = getPeriodKey(startDate, endDate);

    // Если период уже загружен, не делаем повторный запрос
    if (loadedPeriods[periodKey]) {
        return true;
    }

    try {
        const response = await fetch(
            `https://api.nbp.pl/api/exchangerates/tables/a/${startDate}/${endDate}/?format=json`
        );

        if (!response.ok) {
            console.warn(`Не удалось загрузить таблицу курсов за период ${startDate} - ${endDate}`);
            return false;
        }

        const data = await response.json();

        // Обрабатываем все таблицы в ответе
        for (const table of data) {
            const tableDate = table.effectiveDate;

            // Сохраняем курсы для всех валют в этой таблице
            for (const rate of table.rates) {
                if (!exchangeRatesCache[tableDate]) {
                    exchangeRatesCache[tableDate] = {};
                }

                // Сохраняем курс для этой валюты
                exchangeRatesCache[tableDate][rate.code] = rate.mid;
            }
        }

        // Отмечаем период как загруженный
        loadedPeriods[periodKey] = true;
        return true;
    } catch (error) {
        console.error('Ошибка при загрузке таблицы курсов:', error);
        return false;
    }
}

/**
 * Находит ближайшую предыдущую дату с известным курсом
 */
function findClosestPreviousDate(date: string, currency: string): string | null {
    const targetDate = new Date(date);

    // Проверяем до 10 предыдущих дней
    for (let i = 1; i <= 10; i++) {
        const previousDate = new Date(targetDate);
        previousDate.setDate(targetDate.getDate() - i);
        const previousDateStr = formatDate(previousDate);

        if (exchangeRatesCache[previousDateStr]?.[currency]) {
            return previousDateStr;
        }
    }

    return null;
}

/**
 * Получает курс валюты по отношению к PLN
 */
export async function getExchangeRate(currency: string, date: string, skipRatesFetch?: boolean): Promise<number | null> {
    // Если запрашивается курс для PLN, возвращаем 1
    if (currency === 'PLN') return 1;

    // Удаляем кавычки из строки валюты
    currency = currency.replace(/"/g, '');

    // Проверяем, есть ли курс в кэше
    if (exchangeRatesCache[date]?.[currency]) {
        return exchangeRatesCache[date][currency];
    }

    if (skipRatesFetch) {
        return null;
    }

    // Определяем период квартала для загрузки
    const dateObj = new Date(date);
    const {startDate, endDate} = getQuarterDates(dateObj);

    // Загружаем данные за квартал
    const success = await loadExchangeRatesTable(startDate, endDate);

    // Если данные успешно загружены, проверяем наличие курса для нужной даты
    if (success && exchangeRatesCache[date]?.[currency]) {
        return exchangeRatesCache[date][currency];
    }

    // Если курса на точную дату нет, ищем ближайший предыдущий
    const closestDate = findClosestPreviousDate(date, currency);
    if (closestDate) {
        // Кэшируем найденный курс для исходной даты
        if (!exchangeRatesCache[date]) {
            exchangeRatesCache[date] = {};
        }
        exchangeRatesCache[date][currency] = exchangeRatesCache[closestDate][currency];

        return exchangeRatesCache[date][currency];
    }

    console.error(`Не удалось найти курс для ${currency} на дату ${date}`);
    return null;
}

/**
 * Конвертирует сумму из одной валюты в другую
 */
export async function convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    date: string,
    skipRatesFetch?: boolean
): Promise<number | null> {

    if (skipRatesFetch) {
        // Если пропускаем загрузку курсов, просто возвращаем null
        return null;
    }
    // Удаляем кавычки из строк валют
    fromCurrency = fromCurrency.replace(/"/g, '');
    toCurrency = toCurrency.replace(/"/g, '');

    if (fromCurrency === toCurrency) return amount;

    try {
        if (toCurrency === 'PLN') {
            const rate = await getExchangeRate(fromCurrency, date) ;
            if (rate === null) {
                new Error(`Не удалось получить курс для ${fromCurrency}`);
            }
            // @ts-ignore
            return amount * rate;
        } else if (fromCurrency === 'PLN') {
            const rate = await getExchangeRate(toCurrency, date);
            if (rate === null) {
                new Error(`Не удалось получить курс для ${toCurrency}`);
            }
            // @ts-ignore
            return amount / rate;
        } else {
            // Конвертация через PLN
            const fromRate = await getExchangeRate(fromCurrency, date);
            const toRate = await getExchangeRate(toCurrency, date);

            if (fromRate === null || toRate === null) {
                new Error('Не удалось получить курсы для конвертации');
            }

            // @ts-ignore
            const amountInPLN = amount * fromRate;
            // @ts-ignore
            return amountInPLN / toRate;
        }
    } catch (error) {
        console.error('Ошибка при конвертации валюты:', error);
        return null;
    }
}

/**
 * Форматирует сумму в валюте для отображения
 */
export function formatCurrency(amount: number | null, currency: string): string {
    if (amount === null) return 'Ошибка конвертации';

    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}
