import { useState, useEffect, useMemo } from 'react';
import { SortConfig, TableDataHook } from '../types';

export default function useTableData(data: string[][]): TableDataHook {
    const tableData = useMemo(() => data.slice(1), [data]);

    const [filteredData, setFilteredData] = useState<string[][]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [filters, setFilters] = useState<Record<number, string>>({});

    // Инициализация данных
    useEffect(() => {
        setFilteredData(tableData);
    }, [tableData]);

    // Обработка фильтрации, поиска и сортировки
    useEffect(() => {
        let result = [...tableData];

        // Применение фильтров по колонкам
        Object.entries(filters).forEach(([key, value]) => {
            const columnIndex = parseInt(key);
            if (value) {
                result = result.filter(row =>
                    row[columnIndex]?.toLowerCase().includes(value.toLowerCase())
                );
            }
        });

        // Глобальный поиск
        if (searchTerm) {
            result = result.filter(row =>
                row.some(cell => cell?.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Сортировка
        if (sortConfig) {
            result.sort((a, b) => {
                const valueA = a[sortConfig.key] || '';
                const valueB = b[sortConfig.key] || '';

                // Сортировка чисел, если возможно
                const numA = Number(valueA);
                const numB = Number(valueB);

                if (!isNaN(numA) && !isNaN(numB)) {
                    return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
                }

                // Иначе сортировка строк
                return sortConfig.direction === 'asc'
                    ? valueA.localeCompare(valueB)
                    : valueB.localeCompare(valueA);
            });
        }

        setFilteredData(result);
        setCurrentPage(1);
    }, [tableData, searchTerm, filters, sortConfig]);

    // Пагинация
    const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    return {
        filteredData,
        paginatedData,
        searchTerm,
        setSearchTerm,
        filters,
        setFilters,
        sortConfig,
        setSortConfig,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages,
        startIndex
    };
}