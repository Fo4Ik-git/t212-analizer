'use client';

import React, {useEffect, useState} from 'react';
import {CACHE_KEYS} from '@/config/config';
import Table from '@/app/components/Table/Table';
import TabContainer, {Tab} from '@/app/components/TabContainer';
import Diagram from '@/app/components/UI/Diagram/Diagram';
import {Portfolio} from '@/types/trading212';
import {parseCSVData} from '@/services/dataParser';
import Test from '@/app/components/UI/Test/Test';
import {useFileUpload} from '@/hooks/useFileUpload';
import config from '@/config/config.json';

export default function Home() {
    const [csvData, setCsvData] = useState<string[][]>([]);
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isDataProcessed, setIsDataProcessed] = useState<boolean>(false);

    const {
        filesByYear,
        selectedYear,
        setSelectedYear,
        combinedData,
        handleFileUpload,
        removeFile
    } = useFileUpload();

    // Загрузка данных из localStorage при инициализации
    useEffect(() => {
        try {
            // Загрузка флага администратора
            const adminFlag = localStorage.getItem('isAdmin') === 'true';
            setIsAdmin(adminFlag);

            if (config.global.isSaveDataInLocalStorage) {
                // Загрузка обработанных данных
                const savedCsvData = localStorage.getItem(CACHE_KEYS.CSV_DATA);
                const savedPortfolio = localStorage.getItem(CACHE_KEYS.PORTFOLIO);
                const savedIsDataProcessed = localStorage.getItem(CACHE_KEYS.IS_DATA_PROCESSED);

                if (savedCsvData) {
                    setCsvData(JSON.parse(savedCsvData));
                }
                if (savedPortfolio) {
                    setPortfolio(JSON.parse(savedPortfolio));
                }
                if (savedIsDataProcessed === 'true') {
                    setIsDataProcessed(true);
                }
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных:', error);
        }
    }, []);

    // Сохранение обработанных данных при их изменении
    useEffect(() => {
        if (isDataProcessed) {
            try {
                localStorage.setItem(CACHE_KEYS.CSV_DATA, JSON.stringify(csvData));
                localStorage.setItem(CACHE_KEYS.PORTFOLIO, JSON.stringify(portfolio));
                localStorage.setItem(CACHE_KEYS.IS_DATA_PROCESSED, String(isDataProcessed));
            } catch (error) {
                console.error('Ошибка при сохранении данных:', error);
            }
        }
    }, [csvData, portfolio, isDataProcessed]);

    // Обработка данных из файлов
    const processData = async () => {
        if (Object.keys(filesByYear).length === 0) return;

        try {
            // Сортируем годы от старых к новым
            const years = Object.keys(filesByYear).sort();

            // Создаем пустой портфель для объединения результатов
            const combinedPortfolio: Portfolio = {
                transactions: [],
                dividends: [],
                deposits: [],
                withdrawals: [],
                interest: [],
                conversions: []
            };

            // Массив для всех CSV-данных
            const allCsvData: string[][] = [];
            let headerRow: string[] | null = null;

            // Обрабатываем каждый год и файл
            for (const year of years) {
                for (const file of filesByYear[year]) {
                    if (!file.data || file.data.length === 0) continue;

                    // Сохраняем заголовок для таблицы
                    if (!headerRow && file.data[0]) {
                        headerRow = [...file.data[0]];
                        allCsvData.push(headerRow);
                    }

                    try {
                        // Обрабатываем файл
                        const filePortfolio = await parseCSVData(file.data, {
                            skipRatesFetch: false,
                            handleFutureRates: true
                        });

                        // Объединяем результаты
                        Object.keys(filePortfolio).forEach(key => {
                            // Проверяем, что ключ действительно есть в Portfolio
                            if (key in combinedPortfolio) {
                                const typedKey = key as keyof Portfolio;
                                // Проверяем, что оба значения - массивы
                                if (Array.isArray(combinedPortfolio[typedKey]) && Array.isArray(filePortfolio[typedKey])) {
                                    // Приводим типы для безопасного push
                                    (combinedPortfolio[typedKey] as any[]).push(...(filePortfolio[typedKey] as any[]));
                                }
                            }
                        });

                        // Добавляем данные для таблицы
                        if (file.data.length > 1) {
                            allCsvData.push(...file.data.slice(1));
                        }
                    } catch (error) {
                        console.error(`Ошибка при обработке файла ${file.name}:`, error);
                    }
                }
            }

            // Проверяем наличие данных
            if (allCsvData.length > 1) {
                setPortfolio(combinedPortfolio);
                setCsvData(allCsvData);
                setIsDataProcessed(true);
            }
        } catch (error) {
            console.error('Ошибка при обработке данных:', error);
        }
    };

    // Обновление данных без запроса курсов валют
    const handleRefreshData = async () => {
        if (csvData.length > 0) {
            try {
                const parsedPortfolio = await parseCSVData(csvData, {skipRatesFetch: true});
                setPortfolio(parsedPortfolio);
            } catch (error) {
                console.error('Ошибка при обновлении данных:', error);
            }
        }
    };

    // Очистка всех данных из localStorage
    const clearAllData = () => {
        try {
            // Очистка всех ключей
            Object.values(CACHE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });

            // Перезагрузка страницы
            window.location.reload();
        } catch (error) {
            console.error('Ошибка при очистке данных:', error);
        }
    };

    // Определение вкладок
    const tabs: Tab[] = [
        {
            id: 'table',
            label: 'Таблица',
            component: <Table data={csvData}/>,
            className: 'w-full'
        },
        {
            id: 'diagram',
            label: 'Диаграмма',
            component: <Diagram portfolio={portfolio || undefined}/>,
            className: 'w-full'
        },
    ];

    if (isAdmin) {
        tabs.push({
            id: 'test',
            label: 'test',
            component: <Test portfolio={portfolio || undefined}/>,
            className: 'w-full'
        });
    }

    return (
        <div className="p-4 mx-auto">
            <h1 className="text-2xl font-bold mb-4">T212 Analizer and Tax counter in Poland</h1>

            <div className="mb-4">
                {/* Выбор года */}
                <div className="mb-4">
                    <label htmlFor="yearSelect" className="block mb-2">Выберите год для загрузки:</label>
                    <div className="flex">
                        <select
                            id="yearSelect"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="mr-2 p-2 border rounded"
                        >
                            {(() => {
                                // Текущий год и 4 предыдущих
                                const currentYear = new Date().getFullYear();
                                const initialYears = [...Array(5)].map((_, i) => (currentYear - i).toString());

                                // Фильтруем годы - оставляем только те, которые не заняты или текущий выбранный
                                const availableYears = initialYears.filter(year =>
                                    !Object.keys(filesByYear).includes(year) || year === selectedYear
                                );

                                // Добавляем более старые годы если нужно
                                let additionalYear = currentYear - 5;
                                while (availableYears.length < 5) {
                                    const yearStr = additionalYear.toString();
                                    if (!Object.keys(filesByYear).includes(yearStr)) {
                                        availableYears.push(yearStr);
                                    }
                                    additionalYear--;
                                }

                                // Сортируем годы по убыванию
                                availableYears.sort((a, b) => parseInt(b) - parseInt(a));

                                return availableYears.map(year => (
                                    <option key={year} value={year}>
                                        {year} {Object.keys(filesByYear).includes(year) ? '(есть файлы)' : ''}
                                    </option>
                                ));
                            })()}
                        </select>

                        <label
                            htmlFor="csvFileInput"
                            className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
                        >
                            Загрузить файл за {selectedYear} год
                        </label>

                        <input
                            type="file"
                            accept=".csv"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                            id="csvFileInput"
                        />
                    </div>
                </div>

                {/* Список загруженных файлов */}
                {Object.keys(filesByYear).length > 0 && (
                    <div className="mt-4">
                        <h3 className="font-bold">Загруженные файлы:</h3>

                        {Object.keys(filesByYear).sort().map(year => (
                            <div key={year} className="mt-2">
                                <h4 className="font-semibold">{year} год</h4>
                                <ul className="list-disc pl-5">
                                    {filesByYear[year].map((file, index) => (
                                        <li key={index} className="flex items-center justify-between">
                                            <span>{file.name}</span>
                                            <button
                                                onClick={() => removeFile(year, index)}
                                                className="ml-2 text-red-500 hover:text-red-700"
                                            >
                                                Удалить
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        <p className="mt-2">Всего строк: {combinedData.length - 1}</p>
                    </div>
                )}

                {/* Кнопки управления */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {Object.keys(filesByYear).length > 0 && (
                        <button
                            onClick={processData}
                            className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer hover:bg-green-600"
                        >
                            Подсчитать данные
                        </button>
                    )}

                    {isDataProcessed && (
                        <button
                            onClick={handleRefreshData}
                            className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
                        >
                            Обновить данные
                        </button>
                    )}

                    {isDataProcessed && (
                        <button
                            onClick={clearAllData}
                            className="px-4 py-2 bg-red-500 text-white rounded cursor-pointer hover:bg-red-600"
                        >
                            Очистить все данные
                        </button>
                    )}
                </div>
            </div>

            {isDataProcessed && (
                <div className="mt-4">
                    <TabContainer tabs={tabs}/>
                </div>
            )}
        </div>
    );
}
