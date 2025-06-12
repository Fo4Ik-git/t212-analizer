'use client';

import { useState } from 'react';
import Table from "@/app/components/Table/Table";

export default function Home() {
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [fileName, setFileName] = useState<string>('');

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
        {fileName && <p className="mt-2">Выбран файл: {fileName}</p>}
      </div>

      {csvData.length > 0 && (
        <div className="mt-4">
          <Table data={csvData} />
        </div>
      )}
    </div>
  );
}