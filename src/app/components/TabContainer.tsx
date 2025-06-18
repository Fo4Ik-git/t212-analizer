'use client';

import {ReactNode, useEffect, useState} from 'react';
import {useRouter, usePathname, useSearchParams} from 'next/navigation';
import Button, {ButtonVariant} from '@/app/components/Button';

export type Tab = {
    id: string;
    label: string;
    component: ReactNode;
    className?: string;
};

interface TabContainerProps {
    tabs: Tab[];
    tabClassName?: string;
    defaultActiveTab?: string;
}

export default function TabContainer({tabs, tabClassName = '', defaultActiveTab = 'table'}: TabContainerProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');

    // Определяем активную вкладку из параметров URL или используем первую
    const [activeTabId, setActiveTabId] = useState<string>('');

    // При первом рендере или изменении списка вкладок устанавливаем активную вкладку
    useEffect(() => {
        if (tabs.length > 0) {
            // Используем defaultActiveTab, если он предоставлен и существует в списке вкладок
            if (defaultActiveTab && tabs.some(tab => tab.id === defaultActiveTab)) {
                setActiveTabId(defaultActiveTab);
            } else {
                // Иначе используем первую вкладку
                setActiveTabId(tabs[0].id);
            }
        }
    }, [tabs, defaultActiveTab]);

    // Функция для переключения вкладок
    const handleTabClick = (tabId: string) => {
        setActiveTabId(tabId);

        // Сохраняем активную вкладку в localStorage, чтобы сохранить её между перезагрузками
        try {
            localStorage.setItem('activeTabId', tabId);
        } catch (error) {
            console.error('Ошибка при сохранении активной вкладки:', error);
        }
    };

    // Находим активную вкладку
    const activeTab = tabs.find(tab => tab.id === activeTabId);

    return (
        <div className="w-full">
            {/* Заголовки вкладок */}
            <div className="flex w-full border-b border-gray-200 mb-4">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`flex px-4 py-2 font-medium ${
                            tab.id === activeTabId
                                ? 'border-b-2 border-blue-500 text-blue-500'
                                : 'text-gray-500 hover:text-gray-700 hover:cursor-pointer'
                        }`}
                        onClick={() => handleTabClick(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Содержимое активной вкладки */}
            {activeTab && (
                <div className={activeTab.className || ''}>
                    {activeTab.component}
                </div>
            )}
        </div>
    );
}
