import React from 'react';
import { SortConfig } from './types';

interface TableHeaderProps {
    headers: string[];
    sortConfig: SortConfig | null;
    onSort: (columnIndex: number) => void;
}

export default function TableHeader({ headers, sortConfig, onSort }: TableHeaderProps) {
    return (
        <tr>
            {headers.map((header, index) => (
                <th
                    key={index}
                    className="px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700"
                    onClick={() => onSort(index)}
                >
                    <div className="flex items-center justify-between">
                        <span>{header}</span>
                        {sortConfig?.key === index && (
                            <span className="text-blue-400">
                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                        )}
                    </div>
                </th>
            ))}
        </tr>
    );
}
