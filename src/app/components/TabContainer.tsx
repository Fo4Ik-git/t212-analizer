'use client';

import {ReactNode, useEffect} from 'react';
import {useRouter, usePathname, useSearchParams} from 'next/navigation';
import Button, {ButtonVariant} from "@/app/components/Button";
export type Tab = {
    id: string;
    label: string;
    component: ReactNode;
    className?: string;
};

interface TabContainerProps {
    tabs: Tab[];
    tabClassName?: string;
}

export default function TabContainer({tabs, tabClassName = ''}: TabContainerProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');

    // Определяем активную вкладку из параметров URL или используем первую
    const activeTabId = tabs.some(tab => tab.id === tabParam) ? tabParam : tabs[0].id;

    // Обновление URL при отсутствии параметра tab
    useEffect(() => {
        if (!tabParam) {
            const params = new URLSearchParams(searchParams);
            if (activeTabId != null) {
                params.set('tab', activeTabId);
            } else {
                params.set('tab', tabs[0].id);
            }
            router.replace(`${pathname}?${params.toString()}`);
        }
    }, [tabParam, activeTabId, pathname, router, searchParams, tabs]);

    // Обработчик переключения вкладок
    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('tab', tabId);
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="w-full">
            <div className="flex space-x-2 mb-6 border-b overflow-x-auto">
                {tabs.map(tab => (
                    <Button
                        variant={ButtonVariant.Tab}
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`px-4 py-2 font-medium whitespace-nowrap ${
                            activeTabId === tab.id
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                        } ${tabClassName} ${tab.className || ''}`}
                    >
                        {tab.label}
                    </Button>
                ))}
            </div>

            {tabs.find(tab => tab.id === activeTabId)?.component}
        </div>
    );
}
