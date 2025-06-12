'use client';

import React, {useEffect, useState} from 'react';
import Table from '@/app/components/Table/Table';
import TabContainer, {Tab} from '@/app/components/TabContainer';
import Diagram from '@/app/components/Diagram/Diagram';
import {Portfolio} from '@/types/trading212';
import {parseCSVData} from '@/services/dataParser';
import Test from '@/app/components/Test/Test';
import {useFileUpload} from '@/hooks/useFileUpload';

export default function Home() {
    const [csvData, setCsvData] = useState<string[][]>([]);
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isDataProcessed, setIsDataProcessed] = useState<boolean>(false);

    const {
        filesByYear,
        selectedYear,
        setSelectedYear,
        availableYears,
        combinedData,
        handleFileUpload,
        removeFile
    } = useFileUpload();

    const processData = async () => {
        if (Object.keys(filesByYear).length > 0) {
            try {
                // Сортируем годы от старых к новым
                const years = Object.keys(filesByYear).sort((a, b) => parseInt(a) - parseInt(b));
                console.log('Обрабатываемые годы:', years);

                // Создаем пустой портфель для объединения результатов
                const combinedPortfolio: Portfolio = {
                    transactions: [],
                    dividends: [],
                    deposits: [],
                    withdrawals: [],
                    interest: [],
                    conversions: []
                };

                // Массив для всех CSV-данных для отображения в таблице
                const allCsvData: string[][] = [];
                let headerRow: string[] | null = null;

                // Обрабатываем каждый год и файл отдельно
                for (const year of years) {
                    const filesForYear = filesByYear[year];
                    console.log(`Обработка ${filesForYear.length} файлов за ${year} год`);

                    for (const file of filesForYear) {
                        // Проверяем наличие данных
                        if (!file.data || file.data.length === 0) {
                            console.warn(`Файл ${file.name} не содержит данных`);
                            continue;
                        }

                        // Сохраняем заголовок для таблицы
                        if (!headerRow && file.data[0]) {
                            headerRow = [...file.data[0]];
                            allCsvData.push(headerRow);
                        }

                        try {
                            // Обрабатываем каждый файл отдельно
                            const filePortfolio = await parseCSVData(file.data, {
                                skipRatesFetch: false,
                                handleFutureRates: true
                            });

                            // Объединяем результаты
                            combinedPortfolio.transactions.push(...filePortfolio.transactions);
                            combinedPortfolio.dividends.push(...filePortfolio.dividends);
                            combinedPortfolio.deposits.push(...filePortfolio.deposits);
                            combinedPortfolio.withdrawals.push(...filePortfolio.withdrawals);
                            combinedPortfolio.interest.push(...filePortfolio.interest);
                            combinedPortfolio.conversions.push(...filePortfolio.conversions);

                            // Добавляем данные (кроме заголовка) для таблицы
                            if (file.data.length > 1) {
                                allCsvData.push(...file.data.slice(1).map(row => [...row]));
                            }
                        } catch (fileError) {
                            console.error(`Ошибка при обработке файла ${file.name}:`, fileError);
                        }
                    }
                }

                // Проверяем, что есть данные после обработки
                if (combinedPortfolio.transactions.length > 0 ||
                    combinedPortfolio.dividends.length > 0 ||
                    combinedPortfolio.deposits.length > 0) {

                    setPortfolio(combinedPortfolio);
                    setCsvData(allCsvData);
                    setIsDataProcessed(true);
                    console.log('Данные успешно обработаны и объединены');
                } else {
                    console.warn('После обработки нет данных для отображения');
                }
            } catch (error) {
                console.error('Ошибка при обработке данных:', error);
            }
        }
    };

    useEffect(() => {
        const adminFlag = localStorage.getItem('isAdmin') === 'true';
        console.log('Admin flag from localStorage:', adminFlag);
        setIsAdmin(adminFlag);
    }, []);

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
            <h1 className="text-2xl font-bold mb-4">CSV Анализатор</h1>

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

                                // Фильтруем годы - оставляем только те, которые не заняты или являются текущим выбранным
                                const availableYears = initialYears.filter(year =>
                                    !Object.keys(filesByYear).includes(year) || year === selectedYear
                                );

                                // Если после фильтрации годов меньше 5, добавляем более старые годы
                                let additionalYear = currentYear - 5;
                                while (availableYears.length < 5) {
                                    const yearStr = additionalYear.toString();
                                    if (!Object.keys(filesByYear).includes(yearStr)) {
                                        availableYears.push(yearStr);
                                    }
                                    additionalYear--;
                                }

                                // Сортируем годы по убыванию (от новых к старым)
                                availableYears.sort((a, b) => parseInt(b) - parseInt(a));

                                // Отображаем все доступные годы
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

                {/* Список загруженных файлов по годам */}
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

                {Object.keys(filesByYear).length > 0 && (
                    <button
                        onClick={processData}
                        className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer hover:bg-green-600 mt-4 mr-2"
                    >
                        Подсчитать данные
                    </button>
                )}

                {isDataProcessed && (
                    <button
                        onClick={handleRefreshData}
                        className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 mt-4"
                    >
                        Обновить данные
                    </button>
                )}
            </div>

            {isDataProcessed && (
                <div className="mt-4">
                    <TabContainer tabs={tabs}/>
                </div>
            )}
        </div>
    );
}
