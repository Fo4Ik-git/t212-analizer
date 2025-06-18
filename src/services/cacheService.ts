// Метаданные кеша для контроля срока жизни
import {CACHE_TTL} from '@/config/config';

interface CacheMetadata {
    lastUpdated: number; // timestamp последнего обновления
    version: string;     // версия структуры кеша
}

class CacheService {
    private readonly defaultTTL = CACHE_TTL;

    /**
     * Проверяет доступность localStorage
     */
    private isLocalStorageAvailable(): boolean {
        return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    }

    /**
     * Сохраняет данные в localStorage с метаданными
     */
    saveData<T>(key: string, data: T, version: string, ttl?: number): void {
        if (!this.isLocalStorageAvailable()) return;
        try {
            // Сохраняем сами данные
            localStorage.setItem(key, JSON.stringify(data));

            // Сохраняем метаданные
            const metadata: CacheMetadata = {
                lastUpdated: Date.now(),
                version
            };
            localStorage.setItem(`${key}_metadata`, JSON.stringify(metadata));
        } catch (error) {
            console.error(`Ошибка при сохранении в кеш (${key}):`, error);
        }
    }

    /**
     * Загружает данные из localStorage
     */
    loadData<T>(key: string, version: string, ttl?: number): T | null {
        if (!this.isLocalStorageAvailable()) return null;
        try {
            // Проверяем валидность кеша
            if (!this.isValid(key, version, ttl)) {
                return null;
            }

            // Загружаем данные
            const data = localStorage.getItem(key);
            if (!data) return null;

            return JSON.parse(data) as T;
        } catch (error) {
            console.error(`Ошибка при загрузке из кеша (${key}):`, error);
            return null;
        }
    }

    /**
     * Проверяет актуальность кеша
     */
    isValid(key: string, version: string, ttl?: number): boolean {
        if (!this.isLocalStorageAvailable()) return false;

        const metadataKey = `${key}_metadata`;
        const metadataStr = localStorage.getItem(metadataKey);

        if (!metadataStr) return false;

        try {
            const metadata = JSON.parse(metadataStr) as CacheMetadata;
            const now = Date.now();
            const actualTTL = ttl ?? this.defaultTTL;

            const isExpired = now - metadata.lastUpdated > actualTTL;
            const isVersionValid = metadata.version === version;

            return !isExpired && isVersionValid;
        } catch {
            return false;
        }
    }

    /**
     * Очищает кеш и его метаданные
     */
    clearCache(key: string): void {
        if (!this.isLocalStorageAvailable()) return;

        localStorage.removeItem(key);
        localStorage.removeItem(`${key}_metadata`);
    }
}

// Экспортируем экземпляр сервиса для использования в приложении
export const cacheService = new CacheService();
