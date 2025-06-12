import { useState, useCallback } from 'react';

export interface FileData {
  name: string;
  data: string[][];
}

export interface FilesByYear {
  [year: string]: FileData[];
}

export function useFileUpload() {
  const [filesByYear, setFilesByYear] = useState<FilesByYear>({});
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [combinedData, setCombinedData] = useState<string[][]>([]);

  // Функция для чтения содержимого файла
  const readFileAsync = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }, []);

  // Функция для обработки загрузки файлов
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Копируем текущее состояние файлов по годам
    const updatedFilesByYear = { ...filesByYear };

    // Если выбранного года нет в структуре, инициализируем его
    if (!updatedFilesByYear[selectedYear]) {
      updatedFilesByYear[selectedYear] = [];
    }

    // Обрабатываем каждый файл
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const data = await readFileAsync(file);

      // Добавляем файл в список для выбранного года
      updatedFilesByYear[selectedYear].push({
        name: file.name,
        data: data.split('\n').map(row => row.split(','))
      });
    }

    // Обновляем состояние файлов по годам
    setFilesByYear(updatedFilesByYear);

    // Обновляем список доступных годов
    setAvailableYears(Object.keys(updatedFilesByYear).sort());

    // Объединяем все файлы
    combineAllFilesByYear(updatedFilesByYear);
  }, [filesByYear, selectedYear, combineAllFilesByYear, readFileAsync]);

  // Функция для объединения всех файлов с учетом годов
  const combineAllFilesByYear = useCallback((filesByYearObj: FilesByYear) => {
    // Получаем все файлы из всех годов
    const allFiles = Object.values(filesByYearObj).flat();

    if (allFiles.length === 0) {
      setCombinedData([]);
      return [];
    }

    // Берем заголовок из первого файла
    const header = allFiles[0].data[0];

    // Объединяем все строки
    let combinedRows: string[][] = [header];

    // Для каждого года (в хронологическом порядке)
    Object.keys(filesByYearObj).sort().forEach(year => {
      const filesForYear = filesByYearObj[year];

      // Для каждого файла в текущем году
      filesForYear.forEach(file => {
        // Добавляем строки (пропуская заголовок)
        combinedRows = combinedRows.concat(file.data.slice(1));
      });
    });

    setCombinedData(combinedRows);
    return combinedRows;
  }, []);

  // Функция для удаления файла
  const removeFile = useCallback((year: string, index: number) => {
    const updatedFilesByYear = { ...filesByYear };

    // Удаляем файл
    updatedFilesByYear[year].splice(index, 1);

    // Если файлов за год не осталось, удаляем год
    if (updatedFilesByYear[year].length === 0) {
      delete updatedFilesByYear[year];
    }

    setFilesByYear(updatedFilesByYear);
    setAvailableYears(Object.keys(updatedFilesByYear).sort());

    // Обновляем данные
    return combineAllFilesByYear(updatedFilesByYear);
  }, [filesByYear, combineAllFilesByYear]);

  return {
    filesByYear,
    selectedYear,
    setSelectedYear,
    availableYears,
    combinedData,
    handleFileUpload,
    removeFile,
    combineAllFilesByYear
  };
}
