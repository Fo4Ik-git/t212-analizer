import React from 'react';

interface TableBodyProps {
    data: string[][];
    headers: string[];
}

export default function TableBody({ data, headers }: TableBodyProps) {
    return (
        <tbody className="bg-gray-900 divide-y divide-gray-800">
            {data.length > 0 ? (
                data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-800 transition duration-150">
                        {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-gray-300">
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))
            ) : (
                <tr>
                    <td
                        colSpan={headers.length}
                        className="px-6 py-4 text-center text-gray-500"
                    >
                        Нет данных для отображения
                    </td>
                </tr>
            )}
        </tbody>
    );
}
