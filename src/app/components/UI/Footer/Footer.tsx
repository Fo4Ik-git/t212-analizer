import React from 'react';
import configData from '@/config/config.json';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const {status, version} = configData.versions;

    return (
        <footer className=" py-8 border-t border-gray-200 mt-auto">
            <div className="mx-auto px-4">
                <div className="flex flex-wrap justify-between gap-8 mb-8">
                    <div className="flex-1 min-w-[200px]">
                        <p className="">Инструмент для анализа финансовыми данными</p>
                        <p className=" mt-2">Статус: {status}, Версия: {version}</p>
                        <p className="text-amber-600 mt-2 font-medium">Внимание: Это не 100% точный анализатор налогов.
                            Вам необходимо самостоятельно проверить правильность подсчета налогов.</p>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
                    <p>&copy; {currentYear} Fo4Ik</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
