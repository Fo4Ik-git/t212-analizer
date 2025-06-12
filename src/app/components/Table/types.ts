// src/app/components/Table/types.ts
export interface TableProps {
    data: string[][];
}

export interface SortConfig {
    key: number;
    direction: 'asc' | 'desc';
}

export interface TableDataHook {
    filteredData: string[][];
    paginatedData: string[][];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filters: Record<number, string>;
    setFilters: (filters: Record<number, string>) => void;
    sortConfig: SortConfig | null;
    setSortConfig: (config: SortConfig | null) => void;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    itemsPerPage: number;
    setItemsPerPage: (count: number) => void;
    totalPages: number;
    startIndex: number;
}