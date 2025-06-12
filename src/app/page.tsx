'use client';

import React, {useEffect, useState} from 'react';
import Table from '@/app/components/Table/Table';
import TabContainer, {Tab} from '@/app/components/TabContainer';
import Diagram from '@/app/components/Diagram/Diagram';
import {Portfolio} from '@/types/trading212';
import {parseCSVData} from '@/services/dataParser';
import Test from '@/app/components/Test/Test';

export default function Home() {
    const [csvData, setCsvData] = useState<string[][]>([]);
    const [fileName, setFileName] = useState<string>('');
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        if (csvData.length > 0) {
            const loadData = async () => {
                try {
                    const parsedPortfolio = await parseCSVData(csvData);
                    setPortfolio(parsedPortfolio);
                } catch (error) {
                    console.error('Ошибка при парсинге CSV:', error);
                }
            };

            loadData();
        }
    }, [csvData]);

    useEffect(() => {
        // Проверяем наличие флага isAdmin в localStorage при монтировании компонента
        const adminFlag = localStorage.getItem('isAdmin') === 'true';

        console.log('Admin flag from localStorage:', adminFlag);

        setIsAdmin(adminFlag);
    }, []);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const rows = text.split('\n').map(row => row.split(','));
            setCsvData(rows);
        };

        reader.readAsText(file);
    };

    const handleRefreshData = async () => {
        if (csvData.length > 0) {
            try {
                // Передаем флаг skipRatesFetch: true, чтобы не запрашивать курсы заново
                const parsedPortfolio = await parseCSVData(csvData, { skipRatesFetch: true });
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
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csvFileInput"
                />
                <label
                    htmlFor="csvFileInput"
                    className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
                >
                    Выбрать CSV файл
                </label>

                {csvData.length > 0 && (
                    <button
                        onClick={handleRefreshData}
                        className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer hover:bg-green-600"
                    >
                        Обновить данные
                    </button>
                )}

                {fileName && <p className="mt-2">Выбран файл: {fileName}</p>}
            </div>

            {csvData.length > 0 && (
                <div className="mt-4">
                    <TabContainer tabs={tabs}/>
                </div>
            )}
        </div>
    );
}
