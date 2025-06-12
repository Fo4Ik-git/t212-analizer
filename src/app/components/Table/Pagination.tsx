import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
    startIndex: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    startIndex,
    onPageChange
}: PaginationProps) {
    return (
        <div className="flex justify-between items-center mt-4 text-gray-300">
            <div className="text-sm">
                Показано {totalItems > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, totalItems)} из {totalItems}
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 border rounded transition duration-150 ${
                        currentPage === 1
                            ? 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed'
                            : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                    }`}
                >
                    Назад
                </button>
                <span className="px-3 py-1 border border-blue-700 rounded bg-blue-700 text-white">
                    {currentPage}
                </span>
                <button
                    onClick={() => {
                        if (currentPage < totalPages) {
                            onPageChange(currentPage + 1);
                        }
                    }}
                    disabled={currentPage >= totalPages}
                    className={`px-3 py-1 border rounded transition duration-150 ${
                        currentPage >= totalPages
                            ? 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed'
                            : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                    }`}
                >
                    Вперед
                </button>
            </div>
        </div>
    );
}
