'use client';

import React from 'react';
import {TableProps} from './types';
import useTableData from './hooks/useTableData';
import TableSearch from './TableSearch';
import TableHeader from './TableHeader';
import TableBody from './TableBody';
import Pagination from './Pagination';

export default function Table({data}: TableProps) {
    const headers = data[0] || [];

    const {
        filteredData,
        paginatedData,
        searchTerm,
        setSearchTerm,
        sortConfig,
        setSortConfig,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages,
        startIndex
    } = useTableData(data);

    // Обработчик сортировки
    const handleSort = (columnIndex: number) => {
        // Вычисляем новое значение напрямую вместо использования функции обновления
        if (sortConfig && sortConfig.key === columnIndex) {
            setSortConfig(
                sortConfig.direction === 'asc'
                    ? {key: columnIndex, direction: 'desc' as const}
                    : {key: columnIndex, direction: 'asc' as const}
            );
        } else {
            setSortConfig({key: columnIndex, direction: 'asc' as const});
        }
    };

    return (
        <div className="w-full">
            <TableSearch
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                itemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
            />

            <div className="overflow-x-auto border border-gray-700 rounded-lg shadow-lg bg-gray-900">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                    <TableHeader
                        headers={headers}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                    />
                    </thead>
                    <TableBody
                        data={paginatedData}
                        headers={headers}
                    />
                </table>
            </div>

            {filteredData.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredData.length}
                    startIndex={startIndex}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
}
