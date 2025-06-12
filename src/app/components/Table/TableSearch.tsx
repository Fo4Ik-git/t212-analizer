import React from 'react';

interface TableSearchProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    itemsPerPage: number;
    setItemsPerPage: (count: number) => void;
}

export default function TableSearch({
    searchTerm,
    setSearchTerm,
    itemsPerPage,
    setItemsPerPage
}: TableSearchProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
            <div className="flex items-center">
                <input
                    type="text"
                    placeholder="Поиск по всей таблице..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500"
                />
            </div>
            <div className="flex items-center gap-2">
                <span className="text-gray-300">Элементов на странице:</span>
                <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="px-2 py-1 bg-gray-800 border border-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={100000}>Все</option>
                </select>
            </div>
        </div>
    );
}